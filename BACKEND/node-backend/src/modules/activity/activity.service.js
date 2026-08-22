import { ActivityEvent } from './activityEvent.model.js';
import { Boardroom } from '../boardrooms/boardroom.model.js';
import { ConnectionRequest } from '../connections/connection.model.js';
import { CONNECTION_STATUS } from '../../config/constants.js';

export async function logActivity(userId, type, refId = null) {
  return ActivityEvent.create({ userId, type, refId });
}

export async function getFeed(userId, limit = 20) {
  return ActivityEvent.find({ userId }).sort({ createdAt: -1 }).limit(limit);
}

// Backs the Member Activity sidebar's "Network Intelligence" panel: boardrooms joined + accepted connections, in one round trip.
export async function getOnlineSidebar(userId) {
  const [boardroomsJoined, connectionsCount] = await Promise.all([
