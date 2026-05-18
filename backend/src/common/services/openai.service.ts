import { and, eq, isNull } from "drizzle-orm";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { openai } from "@/common/config/openai";
import { financialService } from "@/common/services/financial.service";
import { RAGService } from "@/common/services/rag.service";
import * as prompts from "@/common/utils/prompts";
import {
  SATANG_TOOLS,
  SATI_TOOLS,
  SLIP_EXTRACTION_TOOL,
} from "@/common/utils/tools";
import { db } from "@/db";
import { budgets, goals } from "@/db/schema";
import { BudgetService } from "@/modules/budget/budget.service";

const ragService = new RAGService();

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

interface SatangToolArgs {
  startDate?: string;
  endDate?: string;
  query?: string;
  keyword?: string;
  categoryName?: string;
  limit?: number;
  month?: number;
  year?: number;
}

const budgetService = new BudgetService();
const MODEL_NAME = "gpt-4o-mini";
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

  async checkSlipType(base64Image: string): Promise<boolean> {
    try {
      const response = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: prompts.checkSlipTypePrompt },
          {
            role: "user",
            content: [
              { type: "text", text: "ภาพนี้คือสลิปโอนเงินหรือใบเสร็จรับเงินใช่หรือไม่?" },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "low",
                },
              },
            ],
          },
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
    base64Image: string,
    ocrText: string,
    categories: Category[],
    user: string
  ) {
    try {
      const categoryListText = categories
        .map((c) => `${c.id}: ${c.name} (${c.type})`)
        .join("\n");

      const now = new Date();
      const currentDateISO = now.toLocaleDateString("en-CA", {
        timeZone: "Asia/Bangkok",
      });
      const currentYearAD = Number(
        now.toLocaleDateString("en-US", {
          timeZone: "Asia/Bangkok",
          year: "numeric",
        })
      );

      const prompt = prompts.getExtractTransactionPrompt(
        user,
        categoryListText,
        currentDateISO,
        currentYearAD
      );

      const jsonResponse = await openai.chat.completions.create({
        model: MODEL_NAME,
        temperature: 0,
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `อ้างอิงการสะกดคำจากข้อความ OCR นี้:\n---\n${ocrText}\n---\n\nวันที่ปัจจุบัน (อ้างอิง): ${currentDateISO}\n\nจงสกัดข้อมูลจากสลิปอย่างเคร่งครัด โดยทำตามขั้นตอน 1-5 ใน reasoning ก่อนกรอกฟิลด์อื่น ห้ามสลับผู้โอน/ผู้รับ และห้ามใช้ปี พ.ศ. โดยไม่แปลงเป็น ค.ศ.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        tools: [SLIP_EXTRACTION_TOOL],
        tool_choice: {
          type: "function",
          function: { name: "extract_slip_data" },
        },
      });

      const toolCall = jsonResponse.choices[0].message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No tool calls returned from OpenAI");

      if (toolCall.type !== "function") {
        throw new Error("Unexpected tool call type");
      }

      const content = toolCall.function.arguments;
      const data = JSON.parse(content);

      if (!data.date) {
        data.date = new Date().toISOString();
      }

      return data;
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

  async processSatangToolCallsAndStream(
    userId: number,
    messages: ChatCompletionMessageParam[],
    aiLang: "th" | "en" = "th"
  ) {
    const decision = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: messages,
      tools: SATANG_TOOLS,
      tool_choice: "auto",
    });

    const aiMsg = decision.choices[0].message;

    if (aiMsg.tool_calls) {
      messages.push(aiMsg);

      for (const tool of aiMsg.tool_calls) {
        if (tool.type !== "function") continue;
        const fnName = tool.function.name;

        if (fnName === "switch_to_sati") {
          return {
            type: "message_with_action",
            message:
              aiLang === "en"
                ? "Oops! My main job is analysis. 😅 To record transactions, set goals, or manage budgets, let Sati handle it for you!"
                : "โอ๊ะ! หน้าที่หลักของพี่สตางค์คือวิเคราะห์ข้อมูลครับ 😅 ถ้าต้องการบันทึกรายการ ตั้งเป้าหมาย หรือตั้งงบประมาณ ต้องให้น้องสติช่วยจัดการให้นะครับ!",
            action: {
              label: aiLang === "en" ? "Talk to Sati" : "ไปคุยกับน้องสติ",
              action_type: "switch_to_sati",
            },
          };
        }

        let args: SatangToolArgs = {};
        try {
          args = tool.function.arguments
            ? (JSON.parse(tool.function.arguments) as SatangToolArgs)
            : {};
        } catch (e) {
          console.error(
            `[Satang] Error parsing tool arguments for ${fnName}:`,
            e
          );
        }

        let result = "";

        if (fnName === "get_financial_summary") {
          result = await financialService.getSummary(
            userId,
            args.startDate,
            args.endDate
          );
        } else if (fnName === "search_transactions" && args.query) {
          const txs = await ragService.searchTransactions(
            userId,
            args.query,
            args.startDate,
            args.endDate
          );
          if (txs.length) {
            result = txs.join("\n");
          } else {
            result =
              aiLang === "en"
                ? "No transactions found for this period."
                : "ไม่พบข้อมูลธุรกรรมในช่วงเวลานี้ครับ";
          }
        } else if (fnName === "search_stock_knowledge" && args.query) {
          const stocks = await ragService.searchStock(args.query);
          result = JSON.stringify(stocks);
        } else if (fnName === "calculate_spending_by_keyword" && args.keyword) {
          result = await financialService.getSpendingStats(
            userId,
            args.keyword,
            args.startDate,
            args.endDate
          );
        } else if (fnName === "get_spending_by_category" && args.categoryName) {
          result = await financialService.getSpendingByCategory(
            userId,
            args.categoryName,
            args.startDate,
            args.endDate
          );
        } else if (fnName === "get_category_ranking") {
          result = await financialService.getCategoryRanking(
            userId,
            args.startDate,
            args.endDate
          );
        } else if (fnName === "get_top_expenses") {
          result = await financialService.getTopExpenses(
            userId,
            args.limit,
            args.startDate,
            args.endDate,
            args.categoryName
          );
        } else if (fnName === "get_detailed_transactions") {
          result = await financialService.getDetailedTransactions(
            userId,
            args.limit,
            args.startDate,
            args.endDate,
            args.categoryName
          );
        } else if (fnName === "compare_monthly_spending") {
          result = await financialService.compareMonthlySpending(
            userId,
            args.month,
            args.year
          );
        } else if (fnName === "get_goals_and_budgets") {
          result = await financialService.getGoalsAndBudgets(userId);
        }

        messages.push({
          role: "tool",
          tool_call_id: tool.id,
          content: typeof result === "string" ? result : JSON.stringify(result),
        });
      }
    }

    return await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: messages,
      stream: true,
    });
  }

  async handleMessage(
    userId: number,
    content: string,
    categories: (Category & { isGoal?: boolean })[],
    history: ChatHistoryItem[] = [],
    aiLang: "th" | "en" = "th"
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
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      });
      const currentYearAD = Number(
        now.toLocaleDateString("en-US", {
          timeZone: "Asia/Bangkok",
          year: "numeric",
        })
      );

      const currentDateISO = now.toLocaleDateString("en-CA", {
        timeZone: "Asia/Bangkok",
      });

      const extendedSystemPrompt = prompts.getHandleMessagePrompt(
        categoryListText,
        goalListText,
        currentDateTH,
        currentYearAD,
        currentDateISO,
        aiLang
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
        const textContent = choice.content || "ไม่เข้าใจคำสั่งครับ";

        try {
          let jsonStringToParse = textContent;

          const markdownMatch = textContent.match(
            /```(?:json)?\s*(\{[\s\S]*?\})\s*```/i
          );
          if (markdownMatch?.[1]) {
            jsonStringToParse = markdownMatch[1];
          } else {
            const startIdx = textContent.indexOf("{");
            const endIdx = textContent.lastIndexOf("}");
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
              jsonStringToParse = textContent.substring(startIdx, endIdx + 1);
            }
          }

          const parsedContent = JSON.parse(jsonStringToParse);

          if (parsedContent?.type) {
            return parsedContent;
          }
        } catch {}

        return {
          type: "message",
          message: textContent,
        };
      }

      const toolCall = choice.tool_calls[0];

      if (toolCall.type !== "function") {
        return { type: "unclassified", message: "Unsupported tool type" };
      }

      const fnName = toolCall.function.name;

      try {
        const args = JSON.parse(toolCall.function.arguments);
        if (fnName === "switch_to_satang") {
          return {
            type: "message_with_action",
            message:
              aiLang === "en"
                ? "Oh! This question is beyond my recording duties. 😅 For summaries or financial analysis, let's talk to Satang!"
                : "โอ๊ะ! คำถามนี้เกินหน้าที่จดบันทึกของน้องสติแล้วครับ 😅 ถ้าเป็นเรื่องสรุปยอดหรือวิเคราะห์ข้อมูล ต้องให้พี่สตางค์ช่วยดูให้แล้วล่ะครับ!",
            action: {
              label: aiLang === "en" ? "Talk to Satang" : "ไปคุยกับพี่สตางค์",
              action_type: "switch_to_satang",
            },
          };
        }

        if (fnName === "manage_categories") {
          return {
            type: "message_with_action",
            message:
              aiLang === "en"
                ? "Oops! I can't manage categories by myself yet. 😅 To ensure accuracy, you can add or edit categories by clicking the button below!"
                : "โอ๊ะ! ถ้าเป็นการเพิ่มหรือจัดการหมวดหมู่ใหม่ น้องสติยังทำเองไม่ได้ครับ 😅 เพื่อความถูกต้อง พี่สามารถกดไปจัดการเพิ่มหรือแก้ไขหมวดหมู่เองได้ที่ปุ่มด้านล่างนี้เลยครับ!",
            action: {
              label: aiLang === "en" ? "Manage Categories" : "ไปจัดการหมวดหมู่",
              action_type: "manage_categories",
            },
          };
        }

        if (fnName === "create_budget") {
          try {
            const targetCategory = await budgetService.getTargetCategory(
              args.categoryId
            );

            if (targetCategory && targetCategory.type !== "EXPENSE") {
              return {
                type: "message",
                message:
                  aiLang === "en"
                    ? `Normally, we set budgets for "Expenses". Since "${targetCategory.name}" is an income category, there's no need to set a budget. Stay wealthy! 🤑`
                    : `ปกติแล้วเราจะตั้งงบประมาณไว้คุม "รายจ่าย" ครับ รายการ "${targetCategory.name}" เป็นรายรับ ไม่ต้องตั้งงบก็ได้ครับ รวยๆ เฮงๆ ครับ! 🤑`,
              };
            }

            const isDuplicate = await budgetService.checkDuplicate(
              userId,
              args.categoryId,
              args.frequency
            );

            if (isDuplicate) {
              const freqMap: Record<string, { th: string; en: string }> = {
                DAILY: { th: "รายวัน", en: "Daily" },
                WEEKLY: { th: "รายสัปดาห์", en: "Weekly" },
                MONTHLY: { th: "รายเดือน", en: "Monthly" },
                YEARLY: { th: "รายปี", en: "Yearly" },
              };

              const freq = freqMap[args.frequency] || {
                th: args.frequency,
                en: args.frequency,
              };

              return {
                type: "message",
                message:
                  aiLang === "en"
                    ? `It looks like you've already set a "${freq.en}" budget for this category. Would you like to try a different category or frequency? 😊`
                    : `ดูเหมือนว่าพี่ตั้งงบหมวดนี้ในรอบ "${freq.th}" ไว้เรียบร้อยแล้วครับ ลองเปลี่ยนหมวดหรือรอบเวลาดูไหมครับ? 😊`,
              };
            }
          } catch (err) {
            console.error("Check duplicate error:", err);
          }
        }

        if (fnName === "create_goal") {
          if (args.deadline) {
            if (args.deadline < currentDateISO) {
              return {
                type: "message",
                message:
                  aiLang === "en"
                    ? "Setting a goal in the past is impossible (I can't time travel yet! 😅). Please select today or a future date."
                    : "การตั้งเป้าหมายย้อนหลังทำไม่ได้นะครับ (ผมย้อนเวลาไม่ได้ 😅) รบกวนระบุเป็น 'วันนี้' หรือ 'วันในอนาคต' แทนนะครับ",
              };
            }
          }

          if (!args.amount) {
            return {
              type: "message",
              message:
                aiLang === "en"
                  ? "You haven't specified the amount yet. Please let me know the target amount for this goal."
                  : "คุณยังไม่ได้ระบุจำนวนเงินครับ รบกวนระบุจำนวนเงินที่ต้องการตั้งเป้าหมายด้วยนะครับ",
            };
          }

          try {
            const existingGoals = await db.query.goals.findMany({
              where: and(eq(goals.userId, userId), isNull(goals.deletedAt)),
            });

            const targetName = args.name.trim().toLowerCase();
            const duplicate = existingGoals.find(
              (g) => g.name.trim().toLowerCase() === targetName
            );

            const userConfirmKeywords =
              aiLang === "en"
                ? ["confirm", "yes", "do it", "create anyway", "sure"]
                : ["ยืนยัน", "สร้างเลย", "เอาเลย", "สร้างซ้ำ", "เอาอันนี้แหละ"];

            const isUserConfirming = userConfirmKeywords.some((keyword) =>
              content.toLowerCase().includes(keyword)
            );

            if (duplicate && !isUserConfirming) {
              return {
                type: "message",
                message:
                  aiLang === "en"
                    ? `You already have a goal named "${duplicate.name}" 🧐. \nIf you'd like to create a duplicate, please type "confirm" or try a different name.`
                    : `พี่มีเป้าหมายชื่อ "${duplicate.name}" อยู่แล้วนะครับ 🧐 \nถ้าต้องการสร้างซ้ำให้พิมพ์ว่า "ยืนยัน" หรือเปลี่ยนชื่อหน่อยมั้ยครับ?`,
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
              message:
                aiLang === "en"
                  ? `How much was the "${args.description || "item"}"?`
                  : `รายการ "${args.description || "นี้"}" ราคาเท่าไหร่ครับ?`,
            };
          }

          const isGoalId = goalCategories.some(
            (g) => String(g.id) === String(args.categoryId)
          );

          if (isGoalId) {
            args.isGoal = true;
          } else if (args.type === "EXPENSE" && args.categoryId) {
            try {
              const activeBudgets = await db.query.budgets.findMany({
                where: and(
                  eq(budgets.userId, userId),
                  eq(budgets.categoryId, Number(args.categoryId)),
                  isNull(budgets.deletedAt)
                ),
              });

              for (const budget of activeBudgets) {
                const projectedAmount = budget.currentAmount + amount;
                const limit = budget.amount;
                const warningThreshold = limit * 0.9;

                if (
                  projectedAmount >= warningThreshold &&
                  !args.is_force_confirm
                ) {
                  const isExceeded = projectedAmount > limit;
                  let warningMsg = "";

                  if (aiLang === "en") {
                    warningMsg = isExceeded
                      ? `**Budget Exceeded!** This expense will push you over your limit. (Budget: ${limit} / Projected: ${projectedAmount}).\n\nDo you still want to proceed?`
                      : `**Almost out of budget!** This expense puts you very close to your limit. (Budget: ${limit} / Projected: ${projectedAmount}).\n\nDo you still want to proceed?`;
                  } else {
                    warningMsg = isExceeded
                      ? `**พี่ครับ งบจะทะลุแล้วน้า!** รายการนี้จะทำให้หมวดหมู่นี้เกินงบที่ตั้งไว้นะครับ (งบ: ${limit} บ. / ยอดรวมจะเป็น: ${projectedAmount} บ.) \n\nพี่ยังต้องการให้น้องสติบันทึกรายการนี้อยู่มั้ยครับ?`
                      : `**ระวังนิดนึงน้า!** รายการนี้จะทำให้ยอดใช้จ่ายใกล้เต็มงบแล้วนะครับ (งบ: ${limit} บ. / ยอดรวมจะเป็น: ${projectedAmount} บ.) \n\nพี่ยืนยันจะบันทึกรายการนี้มั้ยครับ?`;
                  }

                  return {
                    type: "message",
                    message: warningMsg,
                  };
                }
              }
            } catch (err) {
              console.error("[Sati] Check budget limit error:", err);
            }
          }
        }

        return {
          type: fnName,
          data: args,
        };
      } catch (e) {
        console.error(`[Sati] JSON Parse Error for ${fnName}:`, e);
        return {
          type: "message",
          message:
            aiLang === "en"
              ? "Sorry, I'm having trouble processing that request. Could you try again?"
              : "ขออภัยครับ น้องสติประมวลผลข้อมูลผิดพลาด รบกวนพี่ลองพิมพ์ใหม่อีกครั้งนะครับ",
        };
      }
    } catch (error) {
      console.error("[OpenAI] handleMessage Error:", error);
      return { type: "message", message: "ระบบขัดข้องชั่วคราวครับ" };
    }
  }
}
