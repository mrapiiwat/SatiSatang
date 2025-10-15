import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import * as categoriesModels from './categoriesModels';
import prisma from '../../common/config/prismaClient';

export const createCategory = async (req: Request, res: Response) => {
    try {
        const validatedData = categoriesModels.categorySchema.parse(req.body);

        const data = {
            name: validatedData.name,
            type: validatedData.type,
            userId: Number(req.user),
            iconId: validatedData.iconId
        }

        const category = await prisma.category.create({ data })

        res.status(httpStatus.CREATED).json({
            message: 'Category created successfully',
            data: category,
        })

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
}

export const getCategories = async (req: Request, res: Response) => {
    try {

        const search = req.query.search as string | undefined;

        const where = search
            ? {
                userId: req.user,
                OR: search.split(' ').map((word) => ({
                    name: { contains: word, mode: 'insensitive' as const },
                })),
            }
            : { userId: req.user };

        const category = await prisma.category.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        })


        const data = category.map((cate) => ({
            id: cate.id,
            name: cate.name,
            type: cate.type,
            userId: cate.userId,
            icon: `${process.env.APP_BASE_URL}/api/icon/${cate.iconId}`,
        }));

        return res.status(httpStatus.OK).json({
            message: 'Categories fetched successfully',
            data: data,
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
}

export const getCategory = async (req: Request, res: Response) => {
    try {
        const categoryId = Number(req.params.id);

        if (isNaN(categoryId)) {
            return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid Category id' });
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId, userId: req.user },
        });

        if (!category) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Category not found' });
        }

        const formattedCategory = {
            id: category.id,
            name: category.name,
            type: category.type,
            userId: category.userId,
            icon: `${process.env.APP_BASE_URL}/api/icon/${category.iconId}`,
        };

        return res.status(httpStatus.OK).json({
            message: 'Icons fetched successfully',
            data: formattedCategory,
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
}

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
      res.status(httpStatus.BAD_REQUEST).json({
        message: 'Validation error',
        errors: error,
      });
    } else if (error instanceof Error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Unknown error',
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
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message,
      });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Unknown error',
      });
    }
  }
};
