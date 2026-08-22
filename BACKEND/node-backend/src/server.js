import http from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocketServer } from './sockets/index.js';
import { logger } from './utils/logger.js';

