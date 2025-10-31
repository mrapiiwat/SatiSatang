import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import prisma from '../../common/config/prismaClient';
import * as goalModels from './goalModels';

export const getGoals = async (req: Request, res: Response) => {
  try {
    const goals = await prisma.goals.findMany({
      where: { userId: Number(req.user) },
      include: { goalTransactions: true },
    });

    if (!goals || goals.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'No goals found for this user' });
    }

    const goalsWithCurrentAmount = goals.map((goal) => ({
      ...goal,
      currentAmount: goal.goalTransactions.reduce((sum, t) => sum + t.amount, 0),
    }));

    return res.status(httpStatus.OK).json({
      message: 'Goals fetched successfully',
      data: goalsWithCurrentAmount,
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
