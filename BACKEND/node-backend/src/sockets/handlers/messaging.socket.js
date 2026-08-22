import { z } from 'zod';
import { logger } from '../../utils/logger.js';
import * as messageService from '../../modules/messages/message.service.js';
import * as conversationService from '../../modules/conversations/conversation.service.js';

const sendMessageSchema = z.object({
  contextType: z.enum(['conversation', 'boardroom']),
  contextId: z.string(),
  text: z.string().min(1).max(8000),
});

export function registerMessagingHandlers(io, socket) {
  const userId = socket.userId;

  socket.on('join_conversation', async (conversationId, ack) => {
    try {
      await conversationService.assertParticipant(conversationId, userId);
      socket.join(`conversation:${conversationId}`);
      ack?.({ success: true });
    } catch {
      ack?.({ success: false, error: 'Not a participant of this conversation' });
    }
  });

  socket.on('leave_conversation', (conversationId, ack) => {
    socket.leave(`conversation:${conversationId}`);
    ack?.({ success: true });
  });

  socket.on('send_message', async (payload, ack) => {
