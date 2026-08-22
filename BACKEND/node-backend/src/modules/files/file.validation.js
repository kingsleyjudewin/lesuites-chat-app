import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/png',
  'image/jpeg',
  'image/webp',
];

export const presignSchema = z.object({
  contextType: z.enum(['conversation', 'boardroom']),
  contextId: z.string(),
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_MIME_TYPES),
  size: z
    .number()
    .int()
    .positive()
    .max(25 * 1024 * 1024),
});

export const confirmUploadSchema = z.object({
