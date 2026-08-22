import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { setIO } from './io.js';
import { registerPresenceHandlers } from './handlers/presence.socket.js';
import { registerMessagingHandlers } from './handlers/messaging.socket.js';
import { registerBoardroomHandlers } from './handlers/boardroom.socket.js';
import { registerNotificationHandlers } from './handlers/notifications.socket.js';
import { logger } from '../utils/logger.js';

