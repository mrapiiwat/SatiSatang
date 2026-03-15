import { and, desc, eq, gte, ilike, isNull, lt, or } from "drizzle-orm";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { NotFoundError } from "@/common/exceptions";
import { OpenAIService } from "@/common/services/openai.service";
import { RAGService } from "@/common/services/rag.service";
import { SatangSystemPrompt } from "@/common/utils/prompts";
import { db } from "@/db";
import {
  category,
  chatMessage,
  chatSession,
  goals,
  user,
  userSettings,
} from "@/db/schema";
import type * as chatSchema from "./chat.schema";
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
      const setting = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
      });
      const aiLang = setting?.aiLanguage ?? "th";

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

      let welcomeText = "";
      if (aiLang === "en") {
        welcomeText =
          botType === BotType.Sati
            ? "Hello! I'm Sati, your financial assistant. How can I help you today?"
            : `Hello ${firstName}, I'm Satang. I'm ready to give you investment advice and financial insights!`;
      } else {
        welcomeText =
          botType === BotType.Sati
            ? "สวัสดีครับผม! น้องสติยินดีให้บริการครับ พี่อยากให้ผมช่วยอะไรบอกได้เลยนะครับผม!"
            : `สวัสดีครับ ${firstName} สตางค์ พร้อมแนะนำเคล็ดลับการลงทุนให้พี่แล้วครับ!`;
      }

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
      where: and(eq(category.userId, userId), isNull(category.deletedAt)),
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const userGoals = await db.query.goals.findMany({
      where: and(
        eq(goals.userId, userId),
        eq(goals.finished, false),
        isNull(goals.deletedAt),
        or(gte(goals.deadline, today), isNull(goals.deadline))
      ),
    });

    const allCategoriesForAI = [
      ...categories.map((c) => ({
        ...c,
        isGoal: false,
      })),
      ...userGoals.map((g) => ({
        id: g.id,
        name: g.name,
        type: "EXPENSE",
        userId: g.userId,
        isGoal: true,
      })),
    ];

    const rawHistory = await db.query.chatMessage.findMany({
      where: eq(chatMessage.sessionId, sessionId),
      orderBy: [desc(chatMessage.createdAt)],
      limit: 5,
    });

    const history = rawHistory.reverse();

    const setting = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });
    const aiLang = setting?.aiLanguage ?? "th";

    const result = await openAIService.handleMessage(
      userId,
      content,
      allCategoriesForAI,
      history,
      aiLang
    );

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

    const setting = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
    });
    const aiLang = setting?.aiLanguage ?? "th";

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const currentUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { name: true, balance: true },
    });

    const userName = currentUser?.name?.split(" ")[0] || "พี่";
    const currentBalance = currentUser?.balance || 0;

    const systemPrompt = SatangSystemPrompt(
      userName,
      userId,
      currentBalance,
      todayStr,
      today,
      memories,
      aiLang
    );

    const history = await db.query.chatMessage.findMany({
      where: eq(chatMessage.sessionId, sessionId),
      orderBy: [desc(chatMessage.createdAt)],
      limit: 6,
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

    const stream = await openAIService.processSatangToolCallsAndStream(
      userId,
      messages,
      aiLang
    );

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
