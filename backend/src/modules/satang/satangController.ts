import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import * as satangModels from './satangModels';
import prisma from '../../common/config/prismaClient';
import { Satang } from '../../common/config/openai';

export const createSatangSession = async (req: Request, res: Response) => {
  try {
    const validatedData = satangModels.satangSessionSchema.parse(req.body);
    const now = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

    const session = await prisma.chatSession.create({
      data: {
        title: `${validatedData.title} ${now}`,
        userId: Number(req.user),
      },
    });

    res.status(httpStatus.CREATED).json({
      message: 'Satang Session created successfully',
      data: session,
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

export const getLatestSatangSession = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);

    const latestSession = await prisma.chatSession.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!latestSession) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'No Satang sessions found for this user',
      });
    }

    res.status(httpStatus.OK).json({
      message: 'Latest Satang session fetched successfully',
      data: latestSession,
    });
  } catch (error) {
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
