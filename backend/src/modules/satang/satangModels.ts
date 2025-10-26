import z from 'zod';

export const satangChatSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});
