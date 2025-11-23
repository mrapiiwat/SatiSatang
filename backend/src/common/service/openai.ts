import openai from '../config/openai';
import { checkSlipTypePrompt } from '../utils/prompt';

export interface ChatMessage {
  role: string;
  content: string;
}

interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

interface Icon {
  id: number;
  description: string;
}

interface User {
  name: string;
}

export async function embedding(text: string): Promise<number[]> {
  try {
    if (!text || text.trim() === '') {
      throw new Error('Input text is empty');
    }

    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    const embeddingData = res.data[0]?.embedding;
    if (!embeddingData) {
      throw new Error('No embedding data returned from OpenAI');
    }

    return embeddingData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating embedding:', error.message);
    } else {
      console.error('Unknown error generating embedding:', error);
    }
    throw new Error('Failed to generate embedding');
  }
}

export async function Satang(messages: ChatMessage[], onData: (chunk: string) => void) {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      stream: true,
      messages: messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      if (content) onData(content);
    }
  } catch (error) {
    console.error('Satang Error:', error);
    throw new Error('Failed to connect to OpenAI');
  }
}

export async function checkSlipType(text: string): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: checkSlipTypePrompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
    });

    const answer = response.choices[0].message?.content?.toLowerCase().trim();
    return answer?.includes('yes') ?? false;
  } catch (error) {
    console.error('[checkSlipType] Error:', error);
    throw new Error('Failed to connect to OpenAI');
  }
}

export async function extractTransactionData(text: string, categories: Category[], user: User) {
  try {
    const categoryListText = categories.map((c) => `${c.id}: ${c.name} (${c.type})`).join('\n');

    const prompt = `
      คุณเป็นระบบแปลงข้อมูลสลิปเป็น JSON

      ให้วิเคราะห์ว่าเป็น "INCOME" หรือ "EXPENSE" โดยใช้กฎต่อไปนี้ (สำคัญมาก):
      - ให้ใช้การเทียบชื่อแบบ Fuzzy Matching
      - ชื่อผู้ใช้จริงคือ "${user.name}"
      - ชื่อในสลิปอาจสะกดต่างออกไป เช่น คนละภาษา (ไทย/อังกฤษ), สะกดคลาดเคลื่อน, เพิ่ม/ลดตัวอักษร หรือออกเสียงใกล้เคียง
      - ถ้าชื่อผู้ใช้หรือชื่อที่ “ออกเสียง/อ่านใกล้เคียง” ปรากฏในตำแหน่ง **ผู้รับเงิน** → ให้ type = "INCOME"
      - ถ้าปรากฏในตำแหน่ง **ผู้จ่ายเงิน** → ให้ type = "EXPENSE"

      ถ้าไม่พบชื่อผู้ใช้:
      - ถ้าพบคำที่สื่อถึงการจ่าย เช่น "จ่าย", "โอนออก", "ชำระ", "ซื้อ" → ให้ type = "EXPENSE"
      - ถ้าพบคำที่สื่อถึงการได้รับ เช่น "ได้รับ", "โอนเข้า", "เงินเข้า", "รับเงิน" → ให้ type = "INCOME"

      รูปแบบข้อมูล JSON ที่ต้องตอบกลับ:
      {
        "type": "INCOME หรือ EXPENSE",
        "description": "คำอธิบาย",
        "amount": ตัวเลข,
        "toAccount": "ชื่อบัญชีปลายทาง",
        "fromAccount": "ชื่อบัญชีต้นทาง",
        "categoryId": "เลือก id ของ category ที่เหมาะสมที่สุดจาก list"
      }

      Category list ของผู้ใช้:
      ${categoryListText}

      ข้อความสลิป:
      "${text}"

      ตอบเป็น JSON เท่านั้น โดยไม่ต้องมีคำอธิบายเพิ่มเติม
      `;

    const jsonResponse = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: text },
      ],
    });

    const content = jsonResponse.choices[0].message?.content;

    if (!content) {
      throw new Error('No JSON content returned from OpenAI');
    }

    const parsed = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error('[extractTransactionData] Error:', error);
    throw new Error('Failed to extract transaction data from OpenAI');
  }
}

export async function isStockQueryWithAI(query: string): Promise<boolean> {
  const prompt = `
    คุณคือระบบตรวจจับว่าประโยคนี้เกี่ยวกับหุ้นหรือไม่
    ให้ตอบแค่ true หรือ false

    ข้อความ: "${query}"
    `;

  const response = await openai.chat.completions.create({
    model: 'gpt-5-nano',
    messages: [
      { role: 'system', content: 'คุณคือ classifier' },
      { role: 'user', content: prompt },
    ],
  });

  const answer = response.choices[0].message.content?.trim().toLowerCase();
  return answer === 'true';
}

export async function handleMessage(content: string, categories: Category[], icons: Icon[]) {
  const categoryListText = categories.map((c) => `${c.id}: ${c.name} (${c.type})`).join('\n');

  const iconListText = icons.map((i) => `${i.id}: ${i.description ?? 'ไม่มีคำอธิบาย'}`).join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-5-nano',
    messages: [
      {
        role: 'system',
        content: `
คุณคือผู้ช่วยแปลงข้อความสั้น ๆ ภาษาไทยเป็น JSON สำหรับ:
- transaction
- category
- budget
- goal

**Reference Mapping (QWERTY -> Thai Kedmanee):**
(ใช้แปลงเมื่อข้อความเป็นภาษาอังกฤษที่อ่านไม่รู้เรื่อง หรือลืมปิด CapsLock)

[แถวตัวเลข & Shift]
- 1=ๅ, !=+, 2=/, @=๑, 3=-, #=๒, 4=ภ, $=๓, 5=ถ, %=๔, 6=ุ, ^=ู, 7=ึ, &=฿, 8=ค, *=๕, 9=ต, (=๖, 0=จ, )=๗, -=ข, _=๘, ==ช, +=๙

[แถวบน & Shift]
- q=ๆ, Q=๐, w=ไ, W=", e=ำ, E=ฎ, r=พ, R=ฑ, t=ะ, T=ธ, y=ั, Y=ํ, u=ี, U=๊, i=ร, I=ณ, o=น, O=ฯ, p=ย, P=ญ, [=บ, {=ฐ, ]=ล, }=,, \\=ฃ, |=ฅ

[แถวกลาง & Shift]
- a=ฟ, A=ฤ, s=ห, S=ฆ, d=ก, D=ฏ, f=ด, F=โ, g=เ, G=ฌ, h=้, H=็, j=่, J=๋, k=า, K=ษ, l=ส, L=ศ, ;=ว, :=ซ, '=ง, "= .

[แถวล่าง & Shift]
- z=ผ, Z=(, x=ป, X=), c=แ, C=ฉ, v=อ, V=ฮ, b=ิ, B=ฺ, n=ื, N=์, m=ท, M=?, ,=ม, <=ฒ, .=ใ, >=ฬ, /=ฝ, ?=ฦ

**Priority Rules (กฎลำดับการวิเคราะห์ - สำคัญมาก):**
ให้ตรวจสอบตามลำดับ 1 -> 2 -> 3 ห้ามข้ามขั้นตอน:

1. **เช็คชื่อเฉพาะ/แบรนด์ (Entity Check) [Priority สูงสุด]:**
   - หากข้อความภาษาอังกฤษดูเหมือนชื่อแบรนด์, รุ่นสินค้า, หรือคำศัพท์ที่มีความหมาย **ห้ามแปลงแป้นพิมพ์เป็นไทยเด็ดขาด** ให้แก้คำผิดเป็นชื่อเต็มแทน
   - **Case:** "iphone17pm" -> อ่านว่า "iPhone" (รู้เรื่อง) -> แก้เป็น "iPhone 17 Pro Max" (จบ ไม่ต้องทำข้อ 2)
   - **Case:** "netflix", "spotify", "grab" -> เก็บเป็นภาษาอังกฤษได้เลย
   - แปลงชื่อแบรนด์ที่เขียนทับศัพท์ หรือเขียนย่อ ให้เป็นชื่อทางการ (Proper Name)
   - **Case:** "ซัมซุงเอส22" -> "Samsung Galaxy S22"
   - **Case:** "ไอโฟน15" -> "iPhone 15"

2. **เช็คการลืมเปลี่ยนภาษา (Layout Correction):**
   - หากข้อความภาษาอังกฤษ **อ่านไม่รู้เรื่องเลย** (Gibberish) ให้ลองแปลงด้วย Reference Mapping
   - **Case:** "8jkpk" -> อ่านไม่รู้เรื่อง -> แปลงเป็น "ค่ายา"
   - **Case:** "gvw,j" -> อ่านไม่รู้เรื่อง -> แปลงเป็น "ก๋วยเตี๋ยว"

3. **แก้คำผิด (Typo Correction):**
   - ปรับคำให้สมเหตุสมผลกับบริบทการเงิน (เช่น "จักท่าน" -> "จ่ายค่า...", "ค่านำ" -> "ค่าน้ำ")

กฎการวิเคราะห์:
- ใช้ categoryId จาก list ด้านล่าง หาก AI รู้ว่าตรง
- สำหรับ category ให้เลือก iconId จาก list ด้านล่าง หากเหมาะสม
- หากไม่รู้ field ใด ให้ใส่ null
- หากแยกหมวดหมู่ไม่ได้ ให้ส่ง type = "unclassified" และ message อธิบาย

Category list ของผู้ใช้:
${categoryListText}

Icon list:
${iconListText}

ข้อความอาจสั้น เช่น "ค่าขนม 20", "เงินเดือน 50000", "ตั้งงบ 1000 เดือน", "ตั้งเป้าหมาย แต่งงาน"
ตอบ function call ตาม schema
`,
      },
      { role: 'user', content },
    ],
    functions: [
      {
        name: 'create_transaction',
        description: 'สร้าง transaction',
        parameters: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            description: { type: ['string', 'null'] },
            amount: { type: ['number', 'null'] },
            categoryId: { type: ['string', 'null'] },
          },
          required: ['type'],
        },
      },
      {
        name: 'create_category',
        description: 'สร้าง category',
        parameters: {
          type: 'object',
          properties: {
            name: { type: ['string', 'null'] },
            type: { type: ['string', 'null'], enum: ['INCOME', 'EXPENSE'] },
            iconId: { type: ['number', 'null'] },
          },
          required: [],
        },
      },
      {
        name: 'create_budget',
        description: 'สร้าง budget',
        parameters: {
          type: 'object',
          properties: {
            amount: { type: ['number', 'null'] },
            categoryId: { type: ['string', 'null'] },
            frequency: { type: ['string', 'null'], enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] },
          },
          required: [],
        },
      },
      {
        name: 'create_goal',
        description: 'สร้าง goal',
        parameters: {
          type: 'object',
          properties: {
            name: { type: ['string', 'null'] },
            amount: { type: ['number', 'null'] },
            deadline: { type: ['string', 'null'] },
          },
          required: [],
        },
      },
    ],
  });

  const choice = response.choices[0].message;

  if (!choice?.function_call) {
    return { type: 'unclassified', message: content };
  }

  const { name, arguments: args } = choice.function_call;
  const parsedArgs = JSON.parse(args);

  for (const key in parsedArgs) {
    if (parsedArgs[key] === undefined) parsedArgs[key] = null;
  }

  return { type: name, data: parsedArgs };
}
