import { openai } from "@/common/config/openai";
import * as prompts from "@/common/utils/prompts";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE" | string;
}

export interface Icon {
  id: number;
  description: string | null;
}

export interface User {
  name: string;
}

const MODEL_NAME = "gpt-4o";
const EMBEDDING_MODEL = "text-embedding-3-small";

export class OpenAIService {
  async embedding(text: string): Promise<number[]> {
    try {
      if (!text || text.trim() === "") throw new Error("Input text is empty");

      const res = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: text,
      });

      const embeddingData = res.data[0]?.embedding;
      if (!embeddingData)
        throw new Error("No embedding data returned from OpenAI");

      return embeddingData;
    } catch (error) {
      console.error("[OpenAI] Embedding Error:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  async checkSlipType(text: string): Promise<boolean> {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: prompts.checkSlipTypePrompt },
          { role: "user", content: text },
        ],
      });

      const answer = response.choices[0].message?.content?.toLowerCase().trim();
      return answer?.includes("yes") ?? false;
    } catch (error) {
      console.error("[OpenAI] checkSlipType Error:", error);
      throw new Error("Failed to connect to OpenAI");
    }
  }

  async extractTransactionData(
    text: string,
    categories: Category[],
    user: User
  ) {
    try {
      const categoryListText = categories
        .map((c) => `${c.id}: ${c.name} (${c.type})`)
        .join("\n");

      const prompt = prompts.getExtractTransactionPrompt(
        user.name,
        categoryListText,
        text
      );

      const jsonResponse = await openai.chat.completions.create({
        model: MODEL_NAME,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: text },
        ],
      });

      const content = jsonResponse.choices[0].message?.content;
      if (!content) throw new Error("No JSON content returned from OpenAI");

      return JSON.parse(content);
    } catch (error) {
      console.error("[OpenAI] extractTransactionData Error:", error);
      throw new Error("Failed to extract transaction data");
    }
  }

  async isStockQuery(query: string): Promise<boolean> {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: "คุณคือ classifier" },
          {
            role: "user",
            content: `${prompts.isStockQueryPrompt}\n\nข้อความ: "${query}"`,
          },
        ],
      });

      const answer = response.choices[0].message.content?.trim().toLowerCase();
      return answer === "true";
    } catch (error) {
      console.error("[OpenAI] isStockQuery Error:", error);
      return false;
    }
  }

  async handleMessage(content: string, categories: Category[], icons: Icon[]) {
    try {
      const categoryListText = categories
        .map((c) => `${c.id}: ${c.name} (${c.type})`)
        .join("\n");

      const iconListText = icons
        .map((i) => `${i.id}: ${i.description ?? "ไม่มีคำอธิบาย"}`)
        .join("\n");

      const systemPrompt = prompts.getHandleMessagePrompt(
        categoryListText,
        iconListText
      );

      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content },
        ],
        functions: [
          {
            name: "create_transaction",
            description: "สร้าง transaction",
            parameters: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                description: { type: ["string", "null"] },
                amount: { type: ["number", "null"] },
                categoryId: { type: ["string", "null"] },
              },
              required: ["type"],
            },
          },
          {
            name: "create_category",
            description: "สร้าง category",
            parameters: {
              type: "object",
              properties: {
                name: { type: ["string", "null"] },
                type: { type: ["string", "null"], enum: ["INCOME", "EXPENSE"] },
                iconId: { type: ["number", "null"] },
              },
            },
          },
          {
            name: "create_budget",
            description: "สร้าง budget",
            parameters: {
              type: "object",
              properties: {
                amount: { type: ["number", "null"] },
                categoryId: { type: ["string", "null"] },
                frequency: {
                  type: ["string", "null"],
                  enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
                },
              },
            },
          },
          {
            name: "create_goal",
            description: "สร้าง goal",
            parameters: {
              type: "object",
              properties: {
                name: { type: ["string", "null"] },
                amount: { type: ["number", "null"] },
                deadline: { type: ["string", "null"] },
              },
            },
          },
        ],
        function_call: "auto",
      });

      const choice = response.choices[0].message;

      if (!choice?.function_call) {
        return { type: "unclassified", message: content };
      }

      const { name, arguments: args } = choice.function_call;
      const parsedArgs = JSON.parse(args);

      for (const key in parsedArgs) {
        if (parsedArgs[key] === undefined) parsedArgs[key] = null;
      }

      return { type: name, data: parsedArgs };
    } catch (error) {
      console.error("[OpenAI] handleMessage Error:", error);
      throw new Error("Failed to process message");
    }
  }
}
