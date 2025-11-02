import z from 'zod';

export const FrequencyEnum = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);

export const budgetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be positive'),
  currentAmount: z.number().positive('Amount must be positive'),
  frequency: FrequencyEnum,
});
