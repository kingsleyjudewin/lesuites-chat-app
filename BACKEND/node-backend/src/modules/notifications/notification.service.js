import { Notification } from './notification.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getIO } from '../../sockets/io.js';

export async function createNotification(userId, type, payload = {}) {
  const notification = await Notification.create({ userId, type, payload });
  try {
    getIO().to(`user:${userId}`).emit('notification', notification);
  } catch {
    // Socket layer not up yet (e.g. during startup or tests) — the notification is still persisted for later fetch.
  }
  return notification;
