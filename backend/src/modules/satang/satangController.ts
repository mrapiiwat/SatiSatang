import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import * as satangModels from './satangModels';
import prisma from '../../common/config/prismaClient';
import { Satang } from '../../common/config/openai';

export const SatangChat = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);

    const validatedData = satangModels.satangChatSchema.parse(req.body);

    const latestSession = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    await prisma.chatMessage.create({
      data: {
        role: 'user',
        content: validatedData.content,
        userId: userId,
        sessionId: Number(latestSession?.id),
      },
    });

    const history = await prisma.chatMessage.findMany({
      where: {
        sessionId: Number(latestSession?.id),
      },
      orderBy: { createdAt: 'asc' },
    });

    const messagesForAPI = history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    const reply = await Satang(messagesForAPI);

    const aiMessage = await prisma.chatMessage.create({
      data: {
        role: 'assistant',
        content: reply,
        userId,
        sessionId: Number(latestSession?.id),
      },
    });

    res.status(httpStatus.OK).json({
      message: aiMessage.content,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(httpStatus.BAD_REQUEST).json({
        message: 'Validation error',
        errors: error,
      });
    } else if (error instanceof Error) {
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

export const getOrCreateLatestSatangSession = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);
    const cursor = req.query.cursor as string | undefined;
    const limit = Number(req.query.limit) || 20;

    // หา session ล่าสุด
    const latestSession = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

    // ถ้าไม่มี session ให้สร้างใหม่
    if (!latestSession) {
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

    // ถ้า session เก่ากว่า 1 เดือน ให้สร้างใหม่
    const createdAt = new Date(latestSession.createdAt);
    if (now.getTime() - createdAt.getTime() >= oneMonthMs) {
      const newSession = await prisma.chatSession.create({
        data: {
          title: `Satang ${now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
          userId,
        },
      });

      return res.status(httpStatus.CREATED).json({
        message: 'New Satang session created (older than 1 month)',
        data: { ...newSession, messages: [], nextCursor: null, hasMore: false },
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
      message: 'Latest Satang session fetched successfully',
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
