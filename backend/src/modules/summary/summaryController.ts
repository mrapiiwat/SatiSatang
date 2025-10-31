import { Request, Response } from 'express';
import httpStatus from 'http-status';
import prisma from '../../common/config/prismaClient';
import { Prisma } from '@prisma/client';

export const summary = async (req: Request, res: Response) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const userId = Number(req.user);

    const transactionWhere: Prisma.TransactionWhereInput = { userId };
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59, 999);

      transactionWhere.createdAt = { gte: startDate, lte: endDate };
    }

    const transactions = await prisma.transaction.findMany({
      where: transactionWhere,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    const goals = await prisma.goals.findMany({
      where: { userId },
      include: { goalTransactions: true },
      orderBy: { createdAt: 'desc' },
    });

    const goalsWithCurrentAmount = goals.map((goal) => {
      let currentAmount = 0;
      goal.goalTransactions.forEach((gt) => {
        const gtDate = new Date(gt.createdAt);
        if ((!startDate || gtDate >= startDate) && (!endDate || gtDate <= endDate)) {
          currentAmount += gt.amount;
        }
      });
      return { ...goal, currentAmount };
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    const totalGoalAmount = goalsWithCurrentAmount.reduce((sum, g) => sum + g.amount, 0);
    const totalCurrentAmount = goalsWithCurrentAmount.reduce((sum, g) => sum + g.currentAmount, 0);

    return res.status(httpStatus.OK).json({
      message: 'Summary fetched successfully',
      summary: {
        totalIncome,
        totalExpense,
        balance,
        goalsSummary: {
          totalGoals: goalsWithCurrentAmount.length,
          totalGoalAmount,
          totalCurrentAmount,
        },
      },
      transactions,
      goals: goalsWithCurrentAmount,
    });
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
