import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { verifyAccessToken } from '../utils/jwt';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = req.cookies?.token;
    }
    if (!token) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'No token' });
    }
    const decoded = verifyAccessToken(token!);
    req.user = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(httpStatus.UNAUTHORIZED).json({
        message: 'Invalid or expired access token',
        errors: error.message,
      });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }
}
