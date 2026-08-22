import * as connectionService from './connection.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../sockets/io.js';

export const sendRequest = catchAsync(async (req, res) => {
  const request = await connectionService.sendRequest(req.user.id, req.body.receiverId);
  getIO().to(`user:${req.body.receiverId}`).emit('connection_request_received', request);
  res.status(201).json({ success: true, data: request });
});

export const respond = catchAsync(async (req, res) => {
  const request = await connectionService.respond(req.params.id, req.user.id, req.body.status);
  if (req.body.status === 'accepted') {
    getIO().to(`user:${request.sender}`).emit('connection_request_accepted', request);
  }
  res.json({ success: true, data: request });
});

export const list = catchAsync(async (req, res) => {
  const requests = await connectionService.listForUser(req.user.id);
  res.json({ success: true, data: requests });
});
