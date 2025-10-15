import z from 'zod';

export const satangSessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

export const satangChatSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});
