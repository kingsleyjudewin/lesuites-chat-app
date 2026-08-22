import * as fileService from './file.service.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const presign = catchAsync(async (req, res) => {
  const result = await fileService.createPresignedUpload(req.user.id, req.body);
  res.json({ success: true, data: result });
