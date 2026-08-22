import { z } from 'zod';

export const setStatusSchema = z.object({ status: z.enum(['online', 'away']) });
