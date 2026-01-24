import { and, desc, eq, ilike, lt, sql } from "drizzle-orm";
import { NotFoundError } from "@/common/errors";
import { OpenAIService } from "@/common/services/openai.service";
import { RAGService } from "@/common/services/rag.service";
import { db } from "@/db";
import { category, chatMessage, chatSession, icon, user } from "@/db/schema";
import { BotType } from "./chat.schema";

const ragService = new RAGService();
const openAIService = new OpenAIService();

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
    const categories = await db.query.category.findMany({
      where: eq(category.userId, userId),
    });

    const icons = await db.query.icon.findMany({
      where: sql`${icon.userId} IS NULL OR ${icon.userId} = ${userId}`,
    });

    return await openAIService.handleMessage(content, categories, icons);
  }

  async *chatWithSatang(userId: number, content: string) {
    const { id: sessionId, messages: history } = await this.getOrCreateSession(
      userId,
      BotType.Satang
    );

    await db.insert(chatMessage).values({
      sessionId,
      userId,
      role: "user",
      content,
    });

    const contextHistory = history.slice(-4).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const smartQuery = await ragService.contextualizeQuery(
      content,
      contextHistory
    );

    const [memories, stocks] = await Promise.all([
      ragService.searchMemory(userId, smartQuery),
      ragService.searchStock(smartQuery),
    ]);

    const contextBlock = `
    [Chat Memory]:
    ${memories.length ? memories.map((m) => `- ${m}`).join("\n") : "- No relevant memory."}

    [Stock Knowledge]:
    ${stocks.length ? JSON.stringify(stocks) : "- No stock data found."}
    `;

    const systemPrompt = `You are "Satang" (สตางค์), an investment assistant.
    Answer based ONLY on the context below. If unsure, say "ไม่พบข้อมูลครับ" or provide general investment advice explicitly stating it is general knowledge.
    
    Context:
    ${contextBlock}`;

    void ragService.addMemory(userId, content, "user");

    const stream = openAIService.chatStream([
      { role: "system", content: systemPrompt },
      ...contextHistory,
      { role: "user", content },
    ]);

    let fullReply = "";

    for await (const chunk of stream) {
      if (chunk) {
        fullReply += chunk;
        yield chunk;
      }
    }

    await db.insert(chatMessage).values({
      sessionId,
      userId,
      role: "assistant",
      content: fullReply,
    });

    void ragService.addMemory(userId, fullReply, "assistant");
  }
}
