import z from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  description: z.string().optional(),
  amount: z.preprocess((val) => {
    if (typeof val === 'string') return Number(val);
    return val;
  }, z.number().positive('Amount must be greater than zero')),
  receipt: z.string().optional(),
  toAccount: z.string().optional(),
  fromAccount: z.string().optional(),
  categoryId: z.preprocess((val) => {
    if (typeof val === 'string') return Number(val);
    return val;
  }, z.number()),
  isGoal: z.boolean().optional(),
});

export interface WhereClause {
  userId: number;
  OR?: Array<{ description: { contains: string; mode: 'insensitive' } }>;
  createdAt?: {
    gte: Date;
    lte: Date;
  };
}
