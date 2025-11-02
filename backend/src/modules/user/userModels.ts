import z from 'zod';

export const userPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .refine((val) => /[A-Z]/.test(val), {
        message: 'Password must contain at least one uppercase letter',
      })
      .refine((val) => /[a-z]/.test(val), {
        message: 'Password must contain at least one lowercase letter',
      })
      .refine((val) => /[0-9]/.test(val), {
        message: 'Password must contain at least one number',
      }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const deleteUserSchema = z.object({
  confirm: z.string().min(1),
});

export const updateNameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});
