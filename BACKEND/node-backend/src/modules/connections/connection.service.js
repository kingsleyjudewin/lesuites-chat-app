import { ConnectionRequest } from './connection.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { CONNECTION_STATUS, ACTIVITY_TYPE, NOTIFICATION_TYPE } from '../../config/constants.js';
import { logActivity } from '../activity/activity.service.js';
import { createNotification } from '../notifications/notification.service.js';

export async function sendRequest(senderId, receiverId) {
  if (senderId === receiverId) throw new ApiError(400, 'Cannot connect with yourself');

  const existing = await ConnectionRequest.findOne({
    $or: [
      { sender: senderId, receiver: receiverId },
      { sender: receiverId, receiver: senderId },
    ],
  });
  if (existing) throw new ApiError(409, `Connection request already ${existing.status}`);

  const request = await ConnectionRequest.create({ sender: senderId, receiver: receiverId });
  await createNotification(receiverId, NOTIFICATION_TYPE.CONNECTION_REQUEST, { fromUserId: senderId, requestId: request.id });
  return request;
}

export async function respond(requestId, userId, status) {
  const request = await ConnectionRequest.findOne({ _id: requestId, receiver: userId, status: CONNECTION_STATUS.PENDING });
  if (!request) throw new ApiError(404, 'Pending connection request not found');

  request.status = status;
  request.respondedAt = new Date();
  await request.save();

  if (status === CONNECTION_STATUS.ACCEPTED) {
    await Promise.all([
      logActivity(request.sender, ACTIVITY_TYPE.CONNECTED_WITH, request.receiver),
      logActivity(request.receiver, ACTIVITY_TYPE.CONNECTED_WITH, request.sender),
    ]);
    await createNotification(request.sender, NOTIFICATION_TYPE.CONNECTION_ACCEPTED, { fromUserId: userId, requestId: request.id });
  }

  return request;
}

export async function listForUser(userId) {
  return ConnectionRequest.find({ $or: [{ sender: userId }, { receiver: userId }] }).sort({ createdAt: -1 });
}
