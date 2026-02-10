import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { openai } from "@/common/config/openai";
import * as prompts from "@/common/utils/prompts";
import { SATI_TOOLS } from "@/common/utils/tools";

export interface ChatHistoryItem {
  role: "user" | "assistant" | "system" | string;
  content: string | null;
}

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

  async handleMessage(
    content: string,
    categories: Category[],
    history: ChatHistoryItem[] = []
  ) {
    try {
      const categoryListText = categories
        .map((c) => `ID ${c.id}: ${c.name} (${c.type})`)
        .join("\n");

      const now = new Date();
      const currentDateTH = now.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
      const currentYearAD = now.getFullYear();

      const extendedSystemPrompt = prompts.getHandleMessagePrompt(
        categoryListText,
        currentDateTH,
        currentYearAD
      );

      const historyMessages: ChatCompletionMessageParam[] = history.map(
        (msg) => {
          let cleanContent = msg.content || "";

          try {
            if (cleanContent.trim().startsWith("{")) {
              const parsed = JSON.parse(cleanContent);
              if (parsed.type === "create_transaction") {
                cleanContent = `[COMPLETED TRANSACTION: ${parsed.data.description} amount ${parsed.data.amount}]`;
              } else if (parsed.message) {
                cleanContent = parsed.message;
              }
            }
          } catch (e) {
            console.log(e);
          }

          return {
            role: msg.role === "user" ? "user" : "assistant",
            content: cleanContent,
          } as ChatCompletionMessageParam;
        }
      );

      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: extendedSystemPrompt },
        ...historyMessages,
        { role: "user", content },
      ];

      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: messages,
        tools: SATI_TOOLS,
        tool_choice: "auto",
      });

      const choice = response.choices[0].message;

      if (!choice.tool_calls || choice.tool_calls.length === 0) {
        return {
          type: "message",
          message: choice.content || "ไม่เข้าใจคำสั่งครับ",
        };
      }

      const toolCall = choice.tool_calls[0];

      if (toolCall.type !== "function") {
        return { type: "unclassified", message: "Unsupported tool type" };
      }

      const fnName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      return {
        type: fnName,
        data: args,
      };
    } catch (error) {
      console.error("[OpenAI] handleMessage Error:", error);
      return { type: "message", message: "ระบบขัดข้องชั่วคราวครับ" };
    }
  }
}
