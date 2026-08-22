import { User } from '../users/user.model.js';
import { Conversation } from '../conversations/conversation.model.js';
import { Boardroom } from '../boardrooms/boardroom.model.js';
import { PRESENCE_OFFLINE_GRACE_MS } from '../../config/constants.js';

const activeSockets = new Map(); // userId -> Set<socketId>, in-memory only — see docs/ARCHITECTURE.md for the Redis upgrade path
const offlineTimers = new Map(); // userId -> Timeout

export function addSocket(userId, socketId) {
  if (!activeSockets.has(userId)) activeSockets.set(userId, new Set());
  activeSockets.get(userId).add(socketId);
  return activeSockets.get(userId).size === 1;
}

export function removeSocket(userId, socketId) {
  const set = activeSockets.get(userId);
  if (!set) return true;
  set.delete(socketId);
  if (set.size === 0) {
    activeSockets.delete(userId);
    return true;
  }
  return false;
}

export function isOnline(userId) {
  return activeSockets.has(userId);
}

export async function getPeerUserIds(userId) {
  const [conversations, boardrooms] = await Promise.all([
    Conversation.find({ participants: userId }).select('participants').lean(),
    Boardroom.find({ 'members.userId': userId }).select('members.userId').lean(),
