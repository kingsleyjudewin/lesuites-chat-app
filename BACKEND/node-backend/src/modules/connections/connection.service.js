import { ConnectionRequest } from './connection.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { CONNECTION_STATUS, ACTIVITY_TYPE, NOTIFICATION_TYPE } from '../../config/constants.js';
import { logActivity } from '../activity/activity.service.js';
import { createNotification } from '../notifications/notification.service.js';

export async function sendRequest(senderId, receiverId) {
  if (senderId === receiverId) throw new ApiError(400, 'Cannot connect with yourself');

  const existing = await ConnectionRequest.findOne({
    $or: [
