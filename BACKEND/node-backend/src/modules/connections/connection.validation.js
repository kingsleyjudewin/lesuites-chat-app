import { z } from 'zod';

export const sendRequestSchema = z.object({ receiverId: z.string() });
