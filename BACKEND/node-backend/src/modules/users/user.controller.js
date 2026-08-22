import * as userService from './user.service.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const getMe = catchAsync(async (req, res) => {
  const user = await userService.getById(req.user.id);
  res.json({ success: true, data: user });
});

export const updateMe = catchAsync(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: user });
});
