import { z } from 'zod';

export const updateProfileSchema = z.object({
  title: z.string().max(120).optional(),
  avatarUrl: z.string().url().optional(),
  tags: z.array(z.string().max(32)).max(10).optional(),
  bio: z.string().max(1000).optional(),
});
