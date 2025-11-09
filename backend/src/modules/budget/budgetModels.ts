import z from 'zod';

export const FrequencyEnum = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);

export const budgetSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.number().int('Category ID must be an integer'),
  frequency: FrequencyEnum,
});
