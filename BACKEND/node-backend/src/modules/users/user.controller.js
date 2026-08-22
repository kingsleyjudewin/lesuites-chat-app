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

export const getById = catchAsync(async (req, res) => {
  const user = await userService.getById(req.params.id);
  res.json({ success: true, data: user });
});

export const search = catchAsync(async (req, res) => {
  const result = await userService.search(req.query);
  res.json({ success: true, data: result });
});
