import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  COOKIE_SECRET: z.string().min(16),
  ENCRYPTION_SERVICE_URL: z.string().url(),
  ENCRYPTION_SERVICE_KEY: z.string().min(16),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
});

const parsed = schema.safeParse(process.env);

