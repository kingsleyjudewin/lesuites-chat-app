import http from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocketServer } from './sockets/index.js';
import { logger } from './utils/logger.js';

const httpServer = http.createServer(app);
initSocketServer(httpServer);

async function start() {
  await connectDB();
  httpServer.listen(env.PORT, () => logger.info(`LeSuits backend listening on port ${env.PORT}`));
}

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});

process.on('SIGTERM', shutdown);
