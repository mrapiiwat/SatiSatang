import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import prisma from '../../common/config/prismaClient';
import * as budgetModels from './budgetModels';
import { getDeadlineFromFrequency, getPeriodRangeByFrequency } from '../../common/utils/dateRange';
import { getBudgetCacheKey, clearUserBudgetCache } from '../../common/service/cache';
import redis from '../../common/config/redisClient';

export const createBudget = async (req: Request, res: Response) => {
  try {
    const validatedData = budgetModels.budgetSchema.parse(req.body);
    const userId = Number(req.user);

    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });

    if (!category || category.type !== 'EXPENSE') {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Budget can only be created for expense categories.',
      });
    }

    const { start, end } = getPeriodRangeByFrequency(validatedData.frequency);

    const existingBudget = await prisma.budgets.findFirst({
      where: {
        userId,
        categoryId: validatedData.categoryId,
        frequency: validatedData.frequency,
        createdAt: { gte: start, lte: end },
      },
    });

    if (existingBudget) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'มีงบประเภทนี้ในรอบเวลาเดียวกันแล้ว',
      });
    }

    const deadline = getDeadlineFromFrequency(validatedData.frequency);

    const current = await prisma.transaction.aggregate({
      where: {
        userId,
        categoryId: validatedData.categoryId,
        type: 'EXPENSE',
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    const currentAmount = current._sum.amount ?? 0;

    const newBudget = await prisma.budgets.create({
      data: {
        amount: validatedData.amount,
        userId,
        categoryId: validatedData.categoryId,
        frequency: validatedData.frequency,
        currentAmount,
        deadline,
      },
    });

    await clearUserBudgetCache(userId);

    return res.status(httpStatus.CREATED).json({
      message: 'Budget created successfully',
      data: newBudget,
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

export const getBudgets = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user);
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;

    const isOverDeadline =
      req.query.isOverDeadline === 'true'
        ? true
        : req.query.isOverDeadline === 'false'
          ? false
          : undefined;

    const cacheKey = getBudgetCacheKey(userId, month, year, isOverDeadline);
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(httpStatus.OK).json(JSON.parse(cached));
    }

    const now = new Date();
    const startDate =
      month && year ? new Date(year, month - 1, 1) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate =
      month && year
        ? new Date(year, month, 0, 23, 59, 59, 999)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const budgets = await prisma.budgets.findMany({
      where: {
        userId,
        createdAt: { lte: endDate },
        OR: [{ deadline: { gte: startDate } }, { deadline: null }],
      },
      include: { category: true },
    });

    const budgetsWithCurrent = await Promise.all(
      budgets.map(async (budget) => {
        const current = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: 'EXPENSE',
            createdAt: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        });

        const currentAmount = current._sum.amount ?? 0;

        await prisma.budgets.update({
          where: { id: budget.id },
          data: { currentAmount },
        });

        return {
          id: budget.id,
          amount: budget.amount,
          currentAmount,
          frequency: budget.frequency,
          userId: budget.userId,
          category: {
            id: budget.category.id,
            name: budget.category.name,
          },
          deadline: budget.deadline,
          isOverDeadline: budget.deadline ? budget.deadline < now : false,
        };
      }),
    );

    const filteredBudgets = budgetsWithCurrent.filter((b) =>
      isOverDeadline === undefined ? true : b.isOverDeadline === isOverDeadline,
    );

    const responseData = {
      message: 'Budgets fetched successfully',
      data: filteredBudgets,
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
