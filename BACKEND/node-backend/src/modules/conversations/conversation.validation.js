import { z } from 'zod';

export const createConversationSchema = z.object({
  type: z.enum(['direct', 'group']),
  participantId: z.string().optional(),
  name: z.string().max(80).optional(),
