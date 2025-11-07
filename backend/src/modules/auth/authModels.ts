import z from 'zod';
import { User } from '@prisma/client';

export const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  uid: z.number(),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number' }),
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
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one number' }),
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
