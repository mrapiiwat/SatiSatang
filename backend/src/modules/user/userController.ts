import { Response } from 'express';
import { AuthRequest } from '../../common/middleware/authenticateJWT';
import httpStatus from 'http-status';
import prisma from '../../common/config/prismaClient';

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      res.status(httpStatus.BAD_REQUEST).json({
        error: "Oops! We couldn't find your user info. Please log in again to continue.",
      });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
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
