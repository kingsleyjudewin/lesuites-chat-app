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
