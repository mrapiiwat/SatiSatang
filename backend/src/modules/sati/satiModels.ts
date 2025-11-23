import z from 'zod';

export const checkMessageSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export interface Icon {
  id: number;
  description: string;
}
