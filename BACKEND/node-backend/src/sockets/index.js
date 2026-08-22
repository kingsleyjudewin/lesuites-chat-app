import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { setIO } from './io.js';
import { registerPresenceHandlers } from './handlers/presence.socket.js';
import { registerMessagingHandlers } from './handlers/messaging.socket.js';
import { registerBoardroomHandlers } from './handlers/boardroom.socket.js';
import { registerNotificationHandlers } from './handlers/notifications.socket.js';
import { logger } from '../utils/logger.js';

export function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    logger.debug(`Socket connected: user=${socket.userId} socket=${socket.id}`);
