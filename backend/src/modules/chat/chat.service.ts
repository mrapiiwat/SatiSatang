import { and, desc, eq, ilike, lt } from "drizzle-orm";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { openai } from "@/common/config/openai";
import { NotFoundError } from "@/common/exceptions";
import { financialService } from "@/common/services/financial.service";
import { OpenAIService } from "@/common/services/openai.service";
import { RAGService } from "@/common/services/rag.service";
import { SATANG_TOOLS } from "@/common/utils/tools";
import { db } from "@/db";
import { category, chatMessage, chatSession, user } from "@/db/schema";
import type * as chatSchema from "./chat.schema";
import { BotType } from "./chat.schema";

const ragService = new RAGService();
const openAIService = new OpenAIService();
const MODEL_NAME = "gpt-4o";

export class ChatService {
  async getOrCreateSession(
    userId: number,
    botType: BotType,
    cursor?: number,
    limit = 20
  ) {
    const latestSession = await db.query.chatSession.findFirst({
      where: and(
        eq(chatSession.userId, userId),
        ilike(chatSession.title, `${botType}%`)
      ),
      orderBy: [desc(chatSession.createdAt)],
      with: {
        chatMessages: {
          limit: 1,
        },
      },
    });

    const now = new Date();
    let sessionId = latestSession?.id;
    let isNewSession = false;
    let shouldCreate = false;

    if (!latestSession) {
      shouldCreate = true;
    } else {
      const isSameDate =
        latestSession.createdAt.toDateString() === now.toDateString();

      const isSessionEmpty = latestSession.chatMessages.length === 0;

      if (botType === BotType.Sati) {
        if (!isSameDate && !isSessionEmpty) shouldCreate = true;
      }
    }

    if (shouldCreate) {
      const [newSession] = await db
        .insert(chatSession)
        .values({
          userId,
          title: `${botType} ${now.toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}`,
        })
        .returning();

      sessionId = newSession.id;
      isNewSession = true;

      const userData = await db.query.user.findFirst({
        where: eq(user.id, userId),
        columns: { name: true },
      });
      const firstName = userData?.name.split(" ")[0] || "พี่";

      const welcomeText =
        botType === BotType.Sati
          ? "สวัสดีครับผม! น้องสติยินดีให้บริการครับ พี่อยากให้ผมช่วยอะไรบอกได้เลยนะครับผม น้องสติยินดีช่วยเสมอครับ!"
          : `สวัสดีครับ ${firstName} สตางค์ พร้อมแนะนำเคล็ดลับการลงทุนง่าย ๆ ให้พี่เริ่มต้นได้อย่างมั่นใจครับ!`;

      await db.insert(chatMessage).values({
        sessionId,
        userId,
        role: "assistant",
        content: welcomeText,
      });
    }

    if (!sessionId) throw new NotFoundError("Failed to create session");

    const messages = await db.query.chatMessage.findMany({
      where: and(
        eq(chatMessage.sessionId, sessionId),
        cursor ? lt(chatMessage.id, cursor) : undefined
      ),
      orderBy: [desc(chatMessage.createdAt), desc(chatMessage.id)],
      limit: limit,
    });

    const hasMore = messages.length === limit;

    return {
      id: sessionId,
      messages: messages.reverse(),
      hasMore,
      nextCursor: hasMore ? messages[0].id : null,
      isNewSession,
      title: latestSession?.title || (shouldCreate ? `${botType} ...` : ""),
    };
  }

  async processSatiMessage(userId: number, content: string) {
    const { id: sessionId } = await this.getOrCreateSession(
      userId,
      BotType.Sati
    );

    await db.insert(chatMessage).values({
      sessionId,
      userId,
      role: "user",
      content,
    });

    const categories = await db.query.category.findMany({
      where: eq(category.userId, userId),
    });

    const rawHistory = await db.query.chatMessage.findMany({
      where: eq(chatMessage.sessionId, sessionId),
      orderBy: [desc(chatMessage.createdAt)],
      limit: 5,
    });

    const history = rawHistory.reverse();

    let result = await openAIService.handleMessage(
      content,
      categories,
      history
    );

    if (result.type === "create_transaction") {
      const amount = Number(result.data.amount);

      if (!amount || amount === 0 || Number.isNaN(amount)) {
        result = {
          type: "message",
          message: `รายการ "${result.data.description || "นี้"}" ราคาเท่าไหร่ครับ?`,
        };
      }
    }

    await db.insert(chatMessage).values({
      sessionId,
      userId,
      role: "assistant",
      content: JSON.stringify(result),
    });

    return result;
  }

  async chatWithSati(userId: number, data: chatSchema.satiLog) {
    const { id: sessionId } = await this.getOrCreateSession(
      userId,
      BotType.Sati
    );

    await db.insert(chatMessage).values({
      sessionId,
      userId,
      role: data.role,
      content: data.content,
    });

    return { success: true };
  }

  async *chatWithSatang(userId: number, content: string) {
    const { id: sessionId } = await this.getOrCreateSession(
      userId,
      BotType.Satang
    );

    await db.insert(chatMessage).values({
      sessionId,
      userId,
      role: "user",
      content,
    });

    const memories = await ragService.searchMemory(userId, content);

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const systemPrompt = `You are "Satang", a smart financial assistant.
    User ID: ${userId}
    Current Date: ${todayStr} (Today is ${today.toDateString()})

    Relevant Memories:
    ${memories.length ? memories.join("\n") : "- No prior context."}
    
    Guidelines for Tool Selection:
    1. **Summaries/Balance**: If user asks about "balance", "total overview", "income vs expense" -> Call 'get_financial_summary'.
    2. **Behavior/Context**: If user asks "what did I buy?", "list items", "history", or specific details -> Call 'search_transactions' (Vector Search).
    3. **Specific Calculation**: If user asks "how much spent on [Keyword]?" (e.g., coffee, grab) -> Call 'calculate_spending_by_keyword' (SQL).
    4. **Category Calculation**: If user asks "how much spent on [Category]?" (e.g., food, travel) -> Call 'get_spending_by_category' (SQL).
    
    Guidelines for Date/Time:
    - If user asks about time (e.g., "this month", "last year"), ALWAYS calculate 'startDate' and 'endDate' based on Current Date.
    - Example: If today is 2026-02-07 and user asks "this month", params are startDate="2026-02-01", endDate="2026-02-28".
    
    General:
    - Always answer in Thai.
    `;

    const history = await db.query.chatMessage.findMany({
      where: eq(chatMessage.sessionId, sessionId),
      orderBy: [desc(chatMessage.createdAt)],
      limit: 4,
    });

    const chatHistory = history.reverse().map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content },
    ] as ChatCompletionMessageParam[];

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
        const args = JSON.parse(tool.function.arguments);
        let result = "";

        console.log(`[Satang] Executing Tool: ${fnName}`);

        if (fnName === "get_financial_summary") {
          result = await financialService.getSummary(
            userId,
            args.startDate,
            args.endDate
          );
        } else if (fnName === "search_transactions") {
          const txs = await ragService.searchTransactions(
            userId,
            args.query,
            args.startDate,
            args.endDate
          );
          result = txs.length ? txs.join("\n") : "ไม่พบข้อมูลธุรกรรมในช่วงเวลานี้ครับ";
        } else if (fnName === "search_stock_knowledge") {
          const stocks = await ragService.searchStock(args.query);
          result = JSON.stringify(stocks);
        } else if (fnName === "calculate_spending_by_keyword") {
          result = await financialService.getSpendingStats(
            userId,
            args.keyword,
            args.startDate,
            args.endDate
          );
        } else if (fnName === "get_spending_by_category") {
          result = await financialService.getSpendingByCategory(
            userId,
            args.categoryName,
            args.startDate,
            args.endDate
          );
        }

        messages.push({
          role: "tool",
          tool_call_id: tool.id,
          content: typeof result === "string" ? result : JSON.stringify(result),
        });
      }
    }

    const stream = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: messages,
      stream: true,
    });

    let fullReply = "";

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        fullReply += text;
        yield text;
      }
    }

    await db
      .insert(chatMessage)
      .values({ sessionId, userId, role: "assistant", content: fullReply });
    void ragService.addMemory(userId, fullReply, "assistant");
  }

  async updateMessage(messageId: number, content: string) {
    await db
      .update(chatMessage)
      .set({ content })
      .where(eq(chatMessage.id, messageId));

    return { success: true };
  }
}
