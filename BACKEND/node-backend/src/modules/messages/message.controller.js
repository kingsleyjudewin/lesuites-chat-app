import * as messageService from './message.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../sockets/io.js';

export const update = catchAsync(async (req, res) => {
  const { room, message } = await messageService.editMessage({ messageId: req.params.id, userId: req.user.id, text: req.body.text });
