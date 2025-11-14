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
