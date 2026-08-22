import { z } from 'zod';

export const updateProfileSchema = z.object({
  title: z.string().max(120).optional(),
