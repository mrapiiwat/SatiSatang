import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: string;
  content: string;
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

export async function Satang(messages: ChatMessage[]) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
    });

    return response.choices?.[0]?.message?.content ?? 'No response';
  } catch (error) {
    console.error('Satang Error:', error);
    throw new Error('Failed to connect to OpenAI');
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
