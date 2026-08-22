import { z } from 'zod';

export const sendRequestSchema = z.object({ receiverId: z.string() });
export const respondSchema = z.object({ status: z.enum(['accepted', 'rejected']) });
