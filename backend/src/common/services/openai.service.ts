import { eq } from "drizzle-orm";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { openai } from "@/common/config/openai";
import * as prompts from "@/common/utils/prompts";
import { SATI_TOOLS } from "@/common/utils/tools";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { BudgetService } from "@/modules/budget/budget.service";

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

const budgetService = new BudgetService();
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
    userId: number,
    content: string,
    categories: (Category & { isGoal?: boolean })[],
    history: ChatHistoryItem[] = []
  ) {
    try {
      const normalCategories = categories.filter((c) => !c.isGoal);
      const goalCategories = categories.filter((c) => c.isGoal);

      const categoryListText = normalCategories
        .map((c) => `ID ${c.id}: ${c.name} (${c.type})`)
        .join("\n");

      const goalListText = goalCategories
        .map((g) => `GOAL_ID ${g.id}: ${g.name} (เป้าหมาย)`)
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
        goalListText,
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

      if (fnName === "create_budget") {
        try {
          const targetCategory = await budgetService.getTargetCategory(
            args.categoryId
          );

          if (targetCategory && targetCategory.type !== "EXPENSE") {
            return {
              type: "message",
              message: `ปกติแล้วเราจะตั้งงบประมาณไว้คุม "รายจ่าย" ครับ รายการ "${targetCategory.name}" เป็นรายรับ ไม่ต้องตั้งงบก็ได้ครับ รวยๆ เฮงๆ ครับ! 🤑`,
            };
          }

          const isDuplicate = await budgetService.checkDuplicate(
            userId,
            args.categoryId,
            args.frequency
          );

          if (isDuplicate) {
            const freqMap: Record<string, string> = {
              DAILY: "รายวัน",
              WEEKLY: "รายสัปดาห์",
              MONTHLY: "รายเดือน",
              YEARLY: "รายปี",
            };
            const freqTH = freqMap[args.frequency] || args.frequency;

            return {
              type: "message",
              message: `ดูเหมือนว่าคุณตั้งงบหมวดนี้ในรอบ "${freqTH}" ไว้เรียบร้อยแล้วครับ ลองเปลี่ยนหมวดหรือรอบเวลาดูไหมครับ? 😊`,
            };
          }
        } catch (err) {
          console.error("Check duplicate error:", err);
        }
      }

      if (fnName === "create_goal") {
        if (args.deadline) {
          const deadlineDate = new Date(args.deadline);
          const today = new Date();

          today.setHours(0, 0, 0, 0);

          if (deadlineDate < today) {
            return {
              type: "message",
              message: `การตั้งเป้าหมายย้อนหลังทำไม่ได้นะครับ (ผมย้อนเวลาไม่ได้ 😅) รบกวนระบุเป็น "วันนี้" หรือ "วันในอนาคต" แทนนะครับ`,
            };
          }
        }

        if (!args.amount) {
          return {
            type: "message",
            message: `คุณยังไม่ได้ระบุจำนวนเงินครับ รบกวนระบุจำนวนเงินที่ต้องการตั้งเป้าหมายด้วยนะครับ`,
          };
        }
        
        try {
          const existingGoals = await db.query.goals.findMany({
            where: eq(goals.userId, userId),
          });

          const targetName = args.name.trim().toLowerCase();
          const duplicate = existingGoals.find(
            (g) => g.name.trim().toLowerCase() === targetName
          );

          const userConfirmKeywords = [
            "ยืนยัน",
            "สร้างเลย",
            "เอาเลย",
            "confirm",
            "สร้างซ้ำ",
          ];
          const isUserConfirming = userConfirmKeywords.some((keyword) =>
            content.toLowerCase().includes(keyword)
          );

          if (duplicate && !isUserConfirming) {
            return {
              type: "message",
              message: `คุณมีเป้าหมายชื่อ "${duplicate.name}" อยู่แล้วนะครับ 🧐 \nถ้าต้องการสร้างซ้ำให้พิมพ์ว่า "ยืนยัน" หรือเปลี่ยนชื่อหน่อยมั้ยครับ?`,
            };
          }
        } catch (err) {
          console.error("Check goal duplicate error:", err);
        }
      }

      if (fnName === "create_transaction") {
        const amount = Number(args.amount);
        if (!amount || amount === 0 || Number.isNaN(amount)) {
          return {
            type: "message",
            message: `รายการ "${args.description || "นี้"}" ราคาเท่าไหร่ครับ?`,
          };
        }

        const isGoalId = goalCategories.some(
          (g) => String(g.id) === String(args.categoryId)
        );

        if (isGoalId) {
          args.isGoal = true;
        }
      }

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
