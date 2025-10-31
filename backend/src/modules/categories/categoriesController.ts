import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import * as categoriesModels from './categoriesModels';
import prisma from '../../common/config/prismaClient';
import { Category, Goals, TransactionType } from '@prisma/client';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const validatedData = categoriesModels.categorySchema.parse(req.body);

    const data = {
      name: validatedData.name,
      type: validatedData.type,
      userId: Number(req.user),
      iconId: validatedData.iconId,
    };

    const category = await prisma.category.create({ data });

    return res.status(httpStatus.CREATED).json({
      message: 'Category created successfully',
      data: category,
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

export const getCategories = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const typeParam = req.query.type as string | undefined;
    const includeGoalsParam = req.query.includeGoals as string | undefined;

    const includeGoals = includeGoalsParam === 'true' || includeGoalsParam === '1' ? true : false;

    const type =
      typeParam === 'INCOME'
        ? TransactionType.INCOME
        : typeParam === 'EXPENSE'
          ? TransactionType.EXPENSE
          : undefined;

    const where = {
      userId: Number(req.user),
      ...(type && { type: { equals: type } }),
      ...(search && {
        AND: [
          {
            OR: search.split(' ').map((word) => ({
              name: { contains: word, mode: 'insensitive' as const },
            })),
          },
        ],
      }),
    };

    const categories: Category[] = await prisma.category.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    let goals: Goals[] = [];
    if (includeGoals && (type === TransactionType.EXPENSE || !type)) {
      goals = await prisma.goals.findMany({
        where: { userId: Number(req.user) },
      });
    }

    const combined = [
      ...categories.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        userId: c.userId,
        icon: `${process.env.APP_BASE_URL}/api/icon/${c.iconId}`,
        isGoal: false,
      })),
      ...(includeGoals
        ? goals.map((g) => ({
            id: g.id,
            name: g.name,
            type: 'EXPENSE' as const,
            userId: g.userId,
            isGoal: true,
          }))
        : []),
    ];

    return res.status(httpStatus.OK).json({
      message: `Categories${includeGoals ? ' (and goals)' : ''} fetched successfully`,
      data: combined,
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

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid Category id' });
    }

    const validatedData = categoriesModels.categorySchema.partial().parse(req.body);

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Category not found' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: validatedData,
    });

    const formattedCategory = {
      id: updatedCategory.id,
      name: updatedCategory.name,
      type: updatedCategory.type,
      userId: updatedCategory.userId,
      icon: `${process.env.APP_BASE_URL}/api/icon/${updatedCategory.iconId}`,
    };

    return res.status(httpStatus.OK).json({
      message: 'Category updated successfully',
      data: formattedCategory,
    });
  } catch (error: unknown) {
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

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const categoryId = Number(req.params.id);

    if (isNaN(categoryId)) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid Category id' });
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'Category not found' });
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return res.status(httpStatus.OK).json({ message: 'Category deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    } else {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Unknown error',
      });
    }
  }
};
