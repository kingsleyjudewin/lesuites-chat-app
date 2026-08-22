import { z } from 'zod';

export const createBoardroomSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  memberIds: z.array(z.string()).optional(),
});
