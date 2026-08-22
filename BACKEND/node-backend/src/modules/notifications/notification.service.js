import { Notification } from './notification.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getIO } from '../../sockets/io.js';

export async function createNotification(userId, type, payload = {}) {
  const notification = await Notification.create({ userId, type, payload });
