import z from 'zod';
import { User } from '@prisma/client';

export const CheckEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const verifyEmailSchema = z.object({
  userId: z.number(),
  otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .uppercase('Password must contain at least one uppercase letter')
    .lowercase('Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(64, 'Name must be at most 64 characters long'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

export interface AuthRequest extends Request {
  user?: User;
}
