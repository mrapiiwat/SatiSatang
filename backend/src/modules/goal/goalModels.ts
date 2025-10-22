import { z } from 'zod';

export const goalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  currentAmount: z.number().nonnegative('Current amount cannot be negative').optional(),
  deadline: z.coerce
    .date()
    .optional()
    .refine((date) => !date || date >= new Date(), { message: 'Deadline cannot be in the past' }),
});
