import { PRESENCE_STATUS } from '../../config/constants.js';
import * as presenceService from '../../modules/presence/presence.service.js';
import { logger } from '../../utils/logger.js';

export function registerPresenceHandlers(io, socket) {
  const userId = socket.userId;

  handleConnect();

  socket.on('user_status_changed', async (status) => {
    if (![PRESENCE_STATUS.ONLINE, PRESENCE_STATUS.AWAY].includes(status)) return;
    await presenceService.setStatus(userId, status);
