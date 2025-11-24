import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import * as satiModels from './satiModels';
import { handleMessage } from '../../common/service/openai';
import prisma from '../../common/config/prismaClient';
import { isSameDate } from '../../common/utils/dateRange';

export const checkMessage = async (req: Request, res: Response) => {
  try {
    const validatedData = satiModels.checkMessageSchema.parse(req.body);
    const userId = Number(req.user);

    const categories = await prisma.category.findMany({
      where: { userId },
    });

    const prismaIcons = await prisma.icon.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
      },
      select: {
        id: true,
        description: true,
      },
    });

    const icons: satiModels.Icon[] = prismaIcons.map((i) => ({
      id: i.id,
      description: i.description || '',
    }));

    const response = await handleMessage(validatedData.content, categories, icons);

    if (!response) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Invalid data format. Unable to process JSON.',
        data: null,
      });
    }

    return res.status(httpStatus.OK).json({
      message: 'Successfully parsed message',
      data: response,
    });
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

export const getOrCreateLatestSatiSession = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);
    const cursor = req.query.cursor as string | undefined;
    const limit = Number(req.query.limit) || 20;

    const latestSession = await prisma.chatSession.findFirst({
      where: { userId, title: { startsWith: 'Sati' } },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          where: { role: 'user' },
          take: 1,
        },
      },
    });

    const now = new Date();
    const isSessionEmpty = latestSession && latestSession.messages.length === 0;

    if (!latestSession || (!isSameDate(latestSession.createdAt, now) && !isSessionEmpty)) {
      const newSession = await prisma.chatSession.create({
        data: {
          title: `Sati ${now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`,
          userId,
        },
      });

      await prisma.chatMessage.create({
        data: {
          sessionId: newSession.id,
          userId,
          content:
            'สวัสดีครับผม! น้องสติยินดีให้บริการครับ พี่อยากให้ผมช่วยอะไรบอกได้เลยนะครับผม น้องสติยินดีช่วยเสมองครับ! พี่อยากจดรายรับรายจ่าย หรือจะอยากให้น้องสติจำกัดงบก็บอกได้เลยะครับผม',
          role: 'assistant',
        },
      });

      return res.status(httpStatus.CREATED).json({
        message: latestSession
          ? 'New Sati session created (new day)'
          : 'New Sati session created (no existing session)',
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
      message: 'Existing Sati session fetched successfully',
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
