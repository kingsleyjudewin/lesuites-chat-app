import * as conversationService from './conversation.service.js';
import * as messageService from '../messages/message.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { CONTEXT_TYPE } from '../../config/constants.js';

export const list = catchAsync(async (req, res) => {
  const conversations = await conversationService.listForUser(req.user.id);
  res.json({ success: true, data: conversations });
