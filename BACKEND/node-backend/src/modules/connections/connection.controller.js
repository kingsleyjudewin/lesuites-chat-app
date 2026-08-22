import * as connectionService from './connection.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { getIO } from '../../sockets/io.js';

export const sendRequest = catchAsync(async (req, res) => {
  const request = await connectionService.sendRequest(req.user.id, req.body.receiverId);
