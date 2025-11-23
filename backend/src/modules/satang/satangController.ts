import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import * as satangModels from './satangModels';
import prisma from '../../common/config/prismaClient';
import { searchMemory, addMemory, searchStock } from '../../common/service/qdrant';
import { Satang, ChatMessage, isStockQueryWithAI } from '../../common/service/openai';
import { satangSystem } from '../../common/utils/prompt';
import { Stock } from '@prisma/client';

export const SatangChat = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  try {
    const userId = String(req.user);
    const validatedData = satangModels.satangChatSchema.parse(req.body);

    const latestSession = await prisma.chatSession.findFirst({
      where: { userId: Number(userId), title: { startsWith: 'Satang' } },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const lastTwoMessages = await prisma.chatMessage.findMany({
      where: { sessionId: latestSession?.id },
      orderBy: { createdAt: 'desc' },
      take: 2,
    });

    const sortedLastMessages = lastTwoMessages.reverse();

    await prisma.chatMessage.create({
      data: {
        role: 'user',
        content: validatedData.content,
        userId: Number(userId),
        sessionId: Number(latestSession?.id),
      },
    });

    const memoryResults = await searchMemory(userId, validatedData.content);

    let stockResults: Record<string, Stock>[] = [];
    if (await isStockQueryWithAI(validatedData.content)) {
      stockResults = await searchStock(validatedData.content, 3);
    }

    const messagesForAPI: ChatMessage[] = [
      { role: 'system', content: satangSystem },
      ...memoryResults.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      ...sortedLastMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      ...stockResults.map((stock) => ({
        role: 'system',
        content: `Stock info: ${JSON.stringify(stock)}`,
      })),
      { role: 'user', content: validatedData.content },
    ];

    let fullReply = '';

    await Satang(messagesForAPI, (chunk) => {
      fullReply += chunk;
      res.write(chunk);
    });

    await prisma.chatMessage.create({
      data: {
        role: 'assistant',
        content: fullReply,
        userId: Number(userId),
        sessionId: Number(latestSession?.id),
      },
    });

    await addMemory(userId, validatedData.content, 'user');
    await addMemory(userId, fullReply, 'assistant');

    res.end();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Validation error',
        errors: error,
      });
    } else if (error instanceof Error) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    } else {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }
};

export const getOrCreateLatestSatangSession = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);
    const cursor = req.query.cursor as string | undefined;
    const limit = Number(req.query.limit) || 20;

    const latestSession = await prisma.chatSession.findFirst({
      where: { userId, title: { startsWith: 'Satang' } },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestSession) {
      const now = new Date();
      const session = await prisma.chatSession.create({
        data: {
          title: `Satang ${now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
          userId,
        },
      });

      return res.status(httpStatus.CREATED).json({
        message: 'New Satang session created (no previous session found)',
        data: { ...session, messages: [], nextCursor: null, hasMore: false },
      });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: latestSession.id },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: Number(cursor) },
          }
        : {}),
    });

    const hasMore = messages.length === limit;

    return res.status(httpStatus.OK).json({
      message: 'Existing Satang session fetched successfully',
      data: {
        ...latestSession,
        messages: messages.reverse(),
        nextCursor: hasMore ? messages[messages.length - 1].id : null,
        hasMore,
      },
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(httpStatus.BAD_REQUEST).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }
};
