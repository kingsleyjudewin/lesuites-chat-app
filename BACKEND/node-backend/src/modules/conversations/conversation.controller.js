import * as conversationService from './conversation.service.js';
import * as messageService from '../messages/message.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { CONTEXT_TYPE } from '../../config/constants.js';

export const list = catchAsync(async (req, res) => {
  const conversations = await conversationService.listForUser(req.user.id);
  res.json({ success: true, data: conversations });
});

export const create = catchAsync(async (req, res) => {
  const { type, participantId, name, participantIds } = req.body;
  const conversation =
    type === 'direct'
      ? await conversationService.getOrCreateDirect(req.user.id, participantId)
      : await conversationService.createGroup(req.user.id, { name, participantIds: participantIds || [] });
  res.status(201).json({ success: true, data: conversation });
});

export const getMessages = catchAsync(async (req, res) => {
  await conversationService.assertParticipant(req.params.id, req.user.id);
  const messages = await messageService.listMessages({
    contextType: CONTEXT_TYPE.CONVERSATION,
    contextId: req.params.id,
    userId: req.user.id,
    cursor: req.query.cursor,
    limit: req.query.limit,
  });
  res.json({ success: true, data: messages });
});
