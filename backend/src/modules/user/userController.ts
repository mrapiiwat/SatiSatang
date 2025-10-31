import { Response, Request } from 'express';
import httpStatus from 'http-status';
import prisma from '../../common/config/prismaClient';
import * as userModels from './userModels';
import { ZodError } from 'zod';
import bcrypt from 'bcrypt';

export const me = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(httpStatus.BAD_REQUEST).json({
        error: "Oops! We couldn't find your user info. Please log in again to continue.",
      });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user) },
      include: { oauthAccounts: true },
    });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      balance: user.balance,
      oauthAccounts: user.oauthAccounts,
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

export const updateName = async (req: Request, res: Response) => {
  try {
    const { name } = userModels.updateNameSchema.parse(req.body);

    const userId = Number(req.user);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    res.status(httpStatus.OK).json({
      message: 'แก้ไขชื่อผู้ใช้งานสำเร็จ',
      name: updatedUser.name,
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

export const changePassword = async (req: Request, res: Response) => {
  try {
    const validatedData = userModels.userPasswordSchema.parse(req.body);

    const userId = Number(req.user);
    if (!userId) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: 'Unauthorized: User not found',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(validatedData.oldPassword, user.password || '');
    if (!isPasswordValid) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Old password is incorrect',
      });
    }

    const isSameAsOld = await bcrypt.compare(validatedData.password, user.password || '');
    if (isSameAsOld) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'New password cannot be the same as the old password',
      });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return res.status(httpStatus.OK).json({
      message: 'Password updated successfully',
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
