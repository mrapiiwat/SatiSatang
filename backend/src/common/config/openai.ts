import { OpenAI } from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY in environment variables');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function ensureOpenAIConnection(): Promise<void> {
  try {
    await openai.models.list();
    console.log('Connected to OpenAI API successfully!');
  } catch (error) {
    console.error('Failed to connect to OpenAI API:', error);
    process.exit(1);
  }
}

ensureOpenAIConnection();

export default openai;
