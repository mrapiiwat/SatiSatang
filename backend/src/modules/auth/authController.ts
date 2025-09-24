import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../../common/utils/jwt';
import {
  createRefreshToken,
  findRefreshTokenByRaw,
  rotateRefreshToken,
  revokeRefreshTokenByRaw,
  hashToken,
} from '../../common/utils/token';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import { sendVerificationEmail } from '../../common/utils/mail';
import * as authModels from './models';
import crypto from 'crypto';
import prisma from '../../common/config/prismaClient';
import path from 'path';
import passport from 'passport';

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const validatedData = authModels.CheckEmailSchema.parse(req.body);
    let user = await prisma.user.findUnique({ where: { email: validatedData.email } });

    if (user?.isEmailVerified) {
      return res.status(httpStatus.CONFLICT).json({ message: 'EXISTS' });
    }

    if (!user) {
      user = await prisma.user.create({ data: { email: validatedData.email } });
    }

    await prisma.emailVerification.deleteMany({ where: { userId: user.id } });
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 ชั่วโมง

    await prisma.emailVerification.create({ data: { tokenHash, expiresAt, userId: user.id } });
    await sendVerificationEmail(validatedData.email, rawToken);

    res.status(httpStatus.OK).json({ message: 'Please check your email to verify your account.' });
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
};

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = authModels.RegisterSchema.parse(req.body);

    let user = await prisma.user.findUnique({ where: { email: validatedData.email } });

    if (!user) {
      return res.status(httpStatus.CONFLICT).json({ message: 'Please verify your email' });
    }

    const hashPassword = validatedData.password
      ? await bcrypt.hash(validatedData.password, 10)
      : undefined;
    user = await prisma.user.update({
      where: {
        email: validatedData.email,
      },
      data: {
        password: hashPassword,
        name: validatedData.name,
      },
    });

    res.status(httpStatus.CREATED).json({
      message: 'Registration successful.',
    });
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
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = authModels.LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: validatedData.email } });

    if (!user || !user.password)
      return res.status(httpStatus.UNAUTHORIZED).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(validatedData.password, user?.password);
    if (!ok)
      return res.status(httpStatus.UNAUTHORIZED).json({ error: 'email or password is incorrect' });
    const accessToken = generateAccessToken(user.id);
    const refreshRaw = await createRefreshToken(user.id);

    res.cookie('refreshToken', refreshRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000,
    });

    res.status(httpStatus.OK).json({ message: 'Login successful', accessToken: accessToken });
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
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = String(req.query.token || '');
    if (!token)
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: 'Missing token ,Please try again later' });
    const tokenHash = hashToken(token);
    const record = await prisma.emailVerification.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
    if (!record) return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid token' });
    if (record.expiresAt < new Date())
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Token expired' });

    await prisma.user.update({ where: { id: record.userId }, data: { isEmailVerified: true } });
    await prisma.emailVerification.delete({ where: { id: record.id } });
    res
      .status(httpStatus.OK)
      .sendFile(path.join(__dirname, '../../common/view/verify-success.html'));
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

export const googleAuthCallback = [
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  async (req: authModels.AuthRequest, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Authentication failed' });
      }

      const accessToken = generateAccessToken(user.id);
      const refreshRaw = await createRefreshToken(user.id);

      res.cookie('refreshToken', refreshRaw, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000,
      });

      res.status(httpStatus.OK).json({ message: 'Login successful', accessToken: accessToken });
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
  },
];

export const facebookAuthCallback = [
  passport.authenticate('facebook', { session: false, failureRedirect: '/' }),
  async (req: authModels.AuthRequest, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Authentication failed' });
      }

      const accessToken = generateAccessToken(user.id);
      const refreshRaw = await createRefreshToken(user.id);

      res.cookie('refreshToken', refreshRaw, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000,
      });

      res.status(httpStatus.OK).json({ message: 'Login successful', accessToken: accessToken });
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
  },
];

export const refreshToken = async (req: Request, res: Response) => {
  const raw = req.cookies?.refreshToken;
  if (!raw) return res.status(401).json({ error: 'No refresh token' });

  const tokenInDb = await findRefreshTokenByRaw(raw);
  if (!tokenInDb || tokenInDb.revoked || tokenInDb.expiresAt < new Date()) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // rotate: create new, revoke old
  const newRaw = await rotateRefreshToken(raw, tokenInDb.userId);

  const accessToken = generateAccessToken(tokenInDb.userId);

  // set new cookie
  res.cookie('refreshToken', newRaw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken });
};

export const logout = async (req: Request, res: Response) => {
  const raw = req.cookies?.refreshToken;
  if (raw) await revokeRefreshTokenByRaw(raw);
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};
