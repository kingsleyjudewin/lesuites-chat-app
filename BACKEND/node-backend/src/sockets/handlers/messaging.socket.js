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
    try {
      const data = sendMessageSchema.parse(payload);
      const message = await messageService.sendMessage({ senderId: userId, ...data });
      io.to(`${data.contextType}:${data.contextId}`).emit('receive_message', message);
      ack?.({ success: true, message });
    } catch (err) {
      logger.error('send_message failed', err);
      ack?.({ success: false, error: err.message });
    }
  });

  socket.on('message_seen', async ({ messageId }) => {
    try {
      const { message, room } = await messageService.markSeen({ messageId, userId });
      io.to(room).emit('message_seen', { messageId: message.id, userId, seenAt: new Date() });
    } catch (err) {
      logger.error('message_seen failed', err);
    }
  });

  socket.on('user_typing', ({ contextType, contextId }) => {
    socket.to(`${contextType}:${contextId}`).emit('user_typing', { userId, contextType, contextId });
  });

  socket.on('user_stopped_typing', ({ contextType, contextId }) => {
    socket.to(`${contextType}:${contextId}`).emit('user_stopped_typing', { userId, contextType, contextId });
  });
}
