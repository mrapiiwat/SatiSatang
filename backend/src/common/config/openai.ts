import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ChatMessage {
  role: string;
  content: string;
}


export async function Satang(messages: ChatMessage[]) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional Thai stock market analyst AI. 
Your task is to analyze the given market data and provide clear, data-driven insights.

When analyzing, follow this structure:

1. Market Overview — summarize the overall market condition and general trend.
2. Key Stocks — highlight 5–10 notable stocks based on price change, percent change, or unusual volume.
3. Trends & Patterns — describe short-term and medium-term price or volume patterns.
4. Insights — identify potential signals, anomalies, or noteworthy movements.
5. Recommendations — give possible actions or interpretations (informational only, not financial advice).

Be concise, structured, and focus on actionable market insights.
`,
        },
        ...messages.map((msg: ChatMessage) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      ],
    });

    return response.choices?.[0]?.message?.content ?? 'No response';
  } catch (error) {
    console.error('Satang Error:', error);
    throw new Error('Failed to connect to OpenAI');
  }
}

export async function Sati(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that provides concise and accurate information.`,
        },
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0]?.message?.content;
  } catch (error) {
    console.error('Error:', error);
  }
}

export async function chatWithAI(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that provides concise and accurate information.`,
        },
        { role: 'user', content: prompt },
      ],
    });

    return response.choices[0]?.message?.content;
  } catch (error) {
    console.error('Error:', error);
  }
}
