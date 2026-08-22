import * as boardroomService from './boardroom.service.js';
import * as messageService from '../messages/message.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../sockets/io.js';
import { CONTEXT_TYPE } from '../../config/constants.js';

export const create = catchAsync(async (req, res) => {
  const boardroom = await boardroomService.create(req.user.id, req.body);
  res.status(201).json({ success: true, data: boardroom });
});

export const list = catchAsync(async (req, res) => {
  const boardrooms = await boardroomService.listForUser(req.user.id);
  res.json({ success: true, data: boardrooms });
});

export const getById = catchAsync(async (req, res) => {
  await boardroomService.assertMember(req.params.id, req.user.id);
  const boardroom = await boardroomService.getById(req.params.id);
  res.json({ success: true, data: boardroom });
});

export const getMessages = catchAsync(async (req, res) => {
  const messages = await messageService.listMessages({
    contextType: CONTEXT_TYPE.BOARDROOM,
    contextId: req.params.id,
    userId: req.user.id,
    cursor: req.query.cursor,
    limit: req.query.limit,
  });
  res.json({ success: true, data: messages });
});

export const addMember = catchAsync(async (req, res) => {
  const boardroom = await boardroomService.addMember(req.params.id, req.user.id, req.body.userId);
  const event = { boardroomId: req.params.id, userId: req.body.userId };
  getIO().to(`boardroom:${req.params.id}`).emit('boardroom_member_added', event);
  getIO().to(`user:${req.body.userId}`).emit('boardroom_member_added', event);
  res.json({ success: true, data: boardroom });
