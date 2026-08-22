import { PRESENCE_STATUS } from '../../config/constants.js';
import * as presenceService from '../../modules/presence/presence.service.js';
import { logger } from '../../utils/logger.js';

export function registerPresenceHandlers(io, socket) {
  const userId = socket.userId;

  handleConnect();

  socket.on('user_status_changed', async (status) => {
    if (![PRESENCE_STATUS.ONLINE, PRESENCE_STATUS.AWAY].includes(status)) return;
    await presenceService.setStatus(userId, status);
    await broadcastToPeers('user_status_changed', { userId, status });
  });

  socket.on('disconnect', handleDisconnect);

  async function handleConnect() {
    const cameOnline = presenceService.addSocket(userId, socket.id);
    presenceService.clearOfflineCheck(userId);
    if (cameOnline) {
      await presenceService.setStatus(userId, PRESENCE_STATUS.ONLINE);
      await broadcastToPeers('user_online', { userId });
    }
  }

  async function handleDisconnect() {
    const fullyDisconnected = presenceService.removeSocket(userId, socket.id);
    if (fullyDisconnected) {
      presenceService.scheduleOfflineCheck(userId, async () => {
        await presenceService.setStatus(userId, PRESENCE_STATUS.OFFLINE);
        await broadcastToPeers('user_offline', { userId, lastSeen: new Date() });
      });
    }
  }

  async function broadcastToPeers(event, payload) {
    try {
      const peers = await presenceService.getPeerUserIds(userId);
      peers.forEach((peerId) => io.to(`user:${peerId}`).emit(event, payload));
    } catch (err) {
      logger.error('Failed to broadcast presence event', err);
    }
  }
}
