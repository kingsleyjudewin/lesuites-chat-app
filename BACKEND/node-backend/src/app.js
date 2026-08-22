import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimiter.js';

export const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(mongoSanitize());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);

app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));
app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);
