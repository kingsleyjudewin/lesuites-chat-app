import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import userRoutes from '../modules/users/user.routes.js';
import conversationRoutes from '../modules/conversations/conversation.routes.js';
import messageRoutes from '../modules/messages/message.routes.js';
import boardroomRoutes from '../modules/boardrooms/boardroom.routes.js';
import presenceRoutes from '../modules/presence/presence.routes.js';
import connectionRoutes from '../modules/connections/connection.routes.js';
import fileRoutes from '../modules/files/file.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import activityRoutes from '../modules/activity/activity.routes.js';

const router = Router();

