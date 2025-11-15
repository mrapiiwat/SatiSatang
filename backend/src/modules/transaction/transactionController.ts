import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import minioClient from '../../common/config/minioClient';
import crypto from 'crypto';
import * as transactionModels from './transactionModels';
import prisma from '../../common/config/prismaClient';
import { extractTextFromImage } from '../../common/config/ocr';
import { checkSlipType, extractTransactionData } from '../../common/service/openai';
import redis from '../../common/config/redisClient';
import { clearUserTransactionCache, getTransactionCacheKey } from '../../common/service/cache';

const BUCKET = process.env.MINIO_BUCKET!;

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const skip = (page - 1) * limit;

    const cacheKey = getTransactionCacheKey(Number(req.user), month, year, search, page, limit);

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(httpStatus.OK).json(JSON.parse(cached));
    }

    let where: transactionModels.WhereClause = { userId: Number(req.user) };

    if (search) {
      where.OR = search.split(' ').map((word) => ({
        description: { contains: word, mode: 'insensitive' as const },
      }));
    }

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const total = await prisma.transaction.count({ where });

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const formattedTransactions = transactions.map((t) => ({
      ...t,
      receipt: t.receipt ? `${process.env.APP_BASE_URL}/api/transaction/receipt/${t.id}` : null,
    }));

    const responseData = {
      message: 'Transactions fetched successfully',
      data: formattedTransactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    await redis.set(cacheKey, JSON.stringify(responseData), { EX: 300 });

    return res.status(httpStatus.OK).json(responseData);
  } catch (error) {
    if (error instanceof Error) {
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

export const getReceipt = async (req: Request, res: Response) => {
  try {
    const transactionId = Number(req.params.id);
    if (isNaN(transactionId)) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid transaction id' });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || !transaction.receipt) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Receipt not found' });
    }

    const stream = await minioClient.getObject(BUCKET, transaction.receipt);

    res.setHeader('Content-Disposition', `inline; filename="${transaction.receipt}"`);

    stream.pipe(res);
  } catch (error) {
    if (error instanceof Error) {
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

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const validatedData = transactionModels.transactionSchema.parse(req.body);
    const file = req.file;
    let filename: string | null = null;

    if (file) {
      const ext = file.originalname.split('.').pop();
      filename = `${crypto.randomUUID()}.${ext}`;
      await minioClient.putObject(BUCKET, filename, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });
    }

    const userId = Number(req.user);

    let goalTransaction = null;

    if (validatedData.isGoal) {
      goalTransaction = await prisma.goalTransaction.create({
        data: {
          goalId: validatedData.categoryId,
          userId,
          amount: validatedData.amount,
        },
      });

      await clearUserTransactionCache(userId);

      return res.status(httpStatus.CREATED).json({
        message: 'Goal transaction created successfully',
        data: goalTransaction,
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: validatedData.type,
        description: validatedData.description,
        amount: validatedData.amount,
        categoryId: validatedData.categoryId,
        receipt: filename,
        userId: userId,
        toAccount: validatedData.toAccount,
        fromAccount: validatedData.fromAccount,
      },
    });

    await clearUserTransactionCache(userId);

    return res.status(httpStatus.CREATED).json({
      message: 'Transaction created successfully',
      data: transaction,
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

export const transactionByUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: 'กรุณาอัปโหลดไฟล์ภาพ' });
    }

    const text = await extractTextFromImage(req.file.buffer);
    if (!text)
      return res.status(httpStatus.BAD_REQUEST).json({ error: 'ไม่สามารถอ่านข้อความจากภาพได้' });

    const isSlip = await checkSlipType(text);
    if (!isSlip)
      return res.status(httpStatus.BAD_REQUEST).json({ error: 'รูปที่อัปโหลดไม่ใช่สลิปการเงิน' });

    const userId = Number(req.user);
    const categories = await prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true, type: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (!user) {
      return res.status(httpStatus.BAD_REQUEST).json({ error: 'User not found' });
    }

    const transactionData = await extractTransactionData(text, categories, user);

    return res.status(httpStatus.OK).json({
      message: 'OCR และการแปลงข้อมูลสำเร็จ',
      transactionData,
    });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const transactionId = Number(req.params.id);
    if (isNaN(transactionId)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Invalid transaction id',
      });
    }

    const validatedData = transactionModels.transactionSchema.partial().parse({ ...req.body });

    const file = req.file;
    let filename: string | null = null;

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existingTransaction) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'Transaction not found',
      });
    }

    if (file) {
      if (existingTransaction.receipt) {
        await minioClient.removeObject(BUCKET, existingTransaction.receipt);
      }

      const ext = file.originalname.split('.').pop();
      filename = `${crypto.randomUUID()}.${ext}`;
      await minioClient.putObject(BUCKET, filename, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...validatedData,
        receipt: filename || existingTransaction.receipt,
        userId: Number(req.user),
      },
    });

    await clearUserTransactionCache(Number(req.user));

    return res.status(httpStatus.OK).json({
      message: 'Transaction updated successfully',
      data: transaction,
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
