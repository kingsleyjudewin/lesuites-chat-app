import { z } from 'zod';

export const editMessageSchema = z.object({ text: z.string().min(1).max(8000) });
export const reactSchema = z.object({ type: z.enum(['approved', 'executive']) });
export const listMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
