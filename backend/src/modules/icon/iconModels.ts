import z from 'zod';

export const createIconSchema = z.object({
  url: z.string().optional(),
  description: z.string().optional(),
  userId: z.string().optional(),
});
