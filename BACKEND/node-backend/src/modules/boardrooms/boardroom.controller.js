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
