import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { stock } from '../utils/stock';
import util from 'util';


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
    const data = await stock()
    const readableData = util.inspect(data, { depth: null, maxArrayLength: null });

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `
You are a professional Thai stock market analyst AI. 
Analyze the following market data and provide concise, actionable insights.

Structure:
1) Market Overview — 1–2 sentences summary of general trend.
2) Key Stocks — highlight 5–8 notable stocks with symbol, %change, and main signal (buy/sell/anomaly).
3) Trends — short-term and medium-term patterns in price/volume.
4) Insights — key signals or anomalies.
5) Recommendations — 2–3 actionable notes (informational only).

Be concise. Do not include unnecessary details.`,
        },
        ...messages.map((msg: ChatMessage) => ({
          role: msg.role as 'user' | 'assistant',
          content: `Analyze the following Thai stock market data: ${readableData} ${msg.content}`,
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
