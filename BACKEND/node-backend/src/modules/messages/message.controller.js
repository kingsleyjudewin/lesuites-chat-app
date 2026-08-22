import * as messageService from './message.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../sockets/io.js';

export const update = catchAsync(async (req, res) => {
  const { room, message } = await messageService.editMessage({ messageId: req.params.id, userId: req.user.id, text: req.body.text });
  getIO().to(room).emit('message_edited', message);
  res.json({ success: true, data: message });
});

export const remove = catchAsync(async (req, res) => {
  const { room, messageId } = await messageService.deleteMessage({ messageId: req.params.id, userId: req.user.id });
  getIO().to(room).emit('message_deleted', { messageId });
  res.json({ success: true, data: { messageId } });
});

export const react = catchAsync(async (req, res) => {
  const { room, message } = await messageService.react({ messageId: req.params.id, userId: req.user.id, type: req.body.type });
  getIO().to(room).emit('message_reacted', message);
  res.status(201).json({ success: true, data: message });
});
