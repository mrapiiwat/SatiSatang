import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { generateAccessToken } from '../../common/utils/jwt';
import {
  createRefreshToken,
  findRefreshTokenByRaw,
  rotateRefreshToken,
  revokeRefreshTokenByRaw,
} from '../../common/utils/token';
import httpStatus from 'http-status';
import { ZodError } from 'zod';
import { sendVerificationEmail } from '../../common/utils/mail';
import * as authModels from './models';
import prisma from '../../common/config/prismaClient';
import passport from 'passport';

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const validatedData = authModels.CheckEmailSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { oauthAccounts: true },
    });

    if (!user) {
      return res.status(httpStatus.OK).json({ message: 'SIGN UP' });
    }

    if (user.password && user.isEmailVerified) {
      return res.status(httpStatus.OK).json({ message: 'SIGN IN' });
    }

    if (user.oauthAccounts.length > 0) {
      return res.status(httpStatus.OK).json({ message: 'OAUTH SIGN IN' });
    }

    return res.status(httpStatus.OK).json({ message: 'PENDING VERIFICATION' });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Validation error',
        errors: error,
      });
    }

    if (error instanceof Error) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Something went wrong!',
        errors: error.message,
      });
    }

    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = authModels.RegisterSchema.parse(req.body);
    const hashPassword = await bcrypt.hash(validatedData.password, 10);
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashPassword,
        name: validatedData.name,
      },
    });

    function generateOTP(length = 6) {
      let otp = '';
      for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10);
      }
      return otp;
    }
    await prisma.emailVerification.deleteMany({ where: { userId: user.id } });

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 นาที

    await prisma.emailVerification.create({
      data: { otpHash, expiresAt, userId: user.id },
    });

    await sendVerificationEmail(validatedData.email, otp);
    res.status(httpStatus.OK).json({
      userId: user.id,
      message: 'Please check your email to verify your account.',
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
    const validateData = authModels.verifyEmailSchema.parse(req.body);
    const { otp, userId } = validateData;

    if (!otp || !userId)
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Missing userId or OTP' });

    const record = await prisma.emailVerification.findFirst({ where: { userId } });
    if (!record) return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid OTP' });

    if (record.expiresAt < new Date())
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'OTP expired' });

    const isValid = await bcrypt.compare(otp, record.otpHash);
    if (!isValid) return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid OTP' });

    await prisma.user.update({ where: { id: userId }, data: { isEmailVerified: true } });
    await prisma.emailVerification.delete({ where: { id: record.id } });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshRaw = await createRefreshToken(user.id);

    res.cookie('refreshToken', refreshRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000,
    });

    res.status(httpStatus.OK).json({
      message: 'Email verified successfully',
      accessToken: accessToken,
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

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const validateData = authModels.CheckEmailSchema.parse(req.body);
    const { email } = validateData;

    if (!email) return res.status(httpStatus.BAD_REQUEST).json({ message: 'Missing email' });

    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        isEmailVerified: false,
      },
    });

    if (!user)
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'User not found or already verified',
      });

    const existingRecord = await prisma.emailVerification.findFirst({
      where: { userId: user.id },
    });

    if (existingRecord) {
      const now = new Date();
      const cooldownMs = 60 * 1000;
      const timeSinceLastOtp = now.getTime() - existingRecord.createdAt.getTime();

      if (timeSinceLastOtp < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastOtp) / 1000);
        return res.status(httpStatus.TOO_MANY_REQUESTS).json({
          message: `Please wait ${remainingSeconds} seconds before requesting new OTP`,
        });
      }

      await prisma.emailVerification.delete({
        where: { id: existingRecord.id },
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 นาที

    await sendVerificationEmail(email, otp);

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt,
      },
    });

    res.status(httpStatus.OK).json({
      message: 'OTP sent successfully',
      userId: user.id,
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

      res.redirect(`${process.env.FRONTEND_BASE_URL}/auth/callback?token=${accessToken}`);
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

      res.redirect(`${process.env.FRONTEND_BASE_URL}/auth/callback?token=${accessToken}`);
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
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) return res.status(401).json({ error: 'No refresh token' });

    const tokenInDb = await findRefreshTokenByRaw(raw);
    if (!tokenInDb || tokenInDb.revoked || tokenInDb.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // rotate: create new, revoke old
    const newRaw = await rotateRefreshToken(raw, tokenInDb.userId);

    const accessToken = generateAccessToken(tokenInDb.userId);

    res.cookie('refreshToken', newRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.REFRESH_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
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

export const logout = async (req: Request, res: Response) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      await revokeRefreshTokenByRaw(raw);
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
    res.json({ message: 'Logged out' });
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
