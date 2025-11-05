import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import prisma from '../../common/config/prismaClient';
import * as goalModels from './goalModels';

export const getGoals = async (req: Request, res: Response) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const isFinished =
      req.query.isFinished === 'true' ? true : req.query.isFinished === 'false' ? false : undefined;
    const userId = Number(req.user);

    const now = new Date();
    const startDate =
      month && year ? new Date(year, month - 1, 1) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate =
      month && year
        ? new Date(year, month, 0, 23, 59, 59, 999)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const goals = await prisma.goals.findMany({
      where: {
        userId,
        createdAt: { lte: endDate },
        OR: [{ deadline: { gte: startDate } }, { deadline: null }],
      },
      include: { goalTransactions: true },
      orderBy: { createdAt: 'desc' },
    });

    const goalsWithAmounts = await Promise.all(
      goals.map(async (goal) => {
        const totalAmount = goal.goalTransactions.reduce((sum, gt) => sum + gt.amount, 0);
        const currentAmount = goal.goalTransactions
          .filter((gt) => {
            const date = new Date(gt.createdAt);
            return date >= startDate && date <= endDate;
          })
          .reduce((sum, gt) => sum + gt.amount, 0);

        if (!goal.finished && totalAmount >= goal.amount) {
          await prisma.goals.update({
            where: { id: goal.id },
            data: { finished: true },
          });
          goal.finished = true;
        }

        return { ...goal, totalAmount, currentAmount };
      }),
    );

    const filteredGoals = goalsWithAmounts.filter((goal) =>
      isFinished === undefined ? true : goal.finished === isFinished,
    );

    const totalGoalAmount = filteredGoals.reduce((sum, g) => sum + g.amount, 0);
    const totalCurrentAmount = filteredGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    return res.status(httpStatus.OK).json({
      message: 'Goals summary fetched successfully',
      data: filteredGoals,
      summary: {
        totalGoals: filteredGoals.length,
        totalGoalAmount,
        totalCurrentAmount,
      },
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

export const createGoal = async (req: Request, res: Response) => {
  try {
    const validatedData = goalModels.goalSchema.parse(req.body);

    const goal = await prisma.goals.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        deadline: validatedData.deadline,
        userId: Number(req.user),
      },
    });
    return res.status(httpStatus.CREATED).json({
      message: 'Goal created successfully',
      data: goal,
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

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const goalId = Number(req.params.id);
    if (isNaN(goalId)) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid Goal id' });
    }
    const validatedData = goalModels.goalSchema.partial().parse(req.body);
    const existingGoal = await prisma.goals.findUnique({
      where: { id: goalId },
    });
    if (!existingGoal) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Goal not found' });
    }
    const updatedGoal = await prisma.goals.update({
      where: { id: goalId },
      data: validatedData,
    });

    return res.status(httpStatus.OK).json({
      message: 'Goal updated successfully',
      data: updatedGoal,
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

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const goalId = Number(req.params.id);
    if (isNaN(goalId)) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid Goal id' });
    }
    const existingGoal = await prisma.goals.findUnique({
      where: { id: goalId },
    });
    if (!existingGoal) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Goal not found' });
    }
    await prisma.goals.delete({
      where: { id: goalId },
    });

    return res.status(httpStatus.OK).json({ message: 'Goal deleted successfully' });
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
