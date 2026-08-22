import * as notificationService from '../../modules/notifications/notification.service.js';
import { logger } from '../../utils/logger.js';

export function registerNotificationHandlers(io, socket) {
  const userId = socket.userId;

  socket.on('notification_read', async (notificationId, ack) => {
    try {
      await notificationService.markRead({ notificationId, userId });
      ack?.({ success: true });
    } catch (err) {
      logger.error('notification_read failed', err);
