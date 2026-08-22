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
