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
  ]);

  const peers = new Set();
  conversations.forEach((c) => c.participants.forEach((p) => peers.add(String(p))));
  boardrooms.forEach((b) => b.members.forEach((m) => peers.add(String(m.userId))));
  peers.delete(String(userId));
  return [...peers];
}

export async function setStatus(userId, status) {
  await User.findByIdAndUpdate(userId, { status, lastSeen: new Date() });
}

// Grace window absorbs tab-switches/reconnects so a brief drop doesn't flash the user offline to their peers.
export function scheduleOfflineCheck(userId, onConfirmedOffline) {
  clearOfflineCheck(userId);
  const timer = setTimeout(async () => {
    offlineTimers.delete(userId);
    if (!isOnline(userId)) {
      await onConfirmedOffline();
    }
  }, PRESENCE_OFFLINE_GRACE_MS);
  offlineTimers.set(userId, timer);
}

export function clearOfflineCheck(userId) {
  const timer = offlineTimers.get(userId);
  if (timer) {
    clearTimeout(timer);
    offlineTimers.delete(userId);
  }
}
