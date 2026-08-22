import * as notificationService from './notification.service.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const list = catchAsync(async (req, res) => {
  const notifications = await notificationService.listForUser(req.user.id);
  res.json({ success: true, data: notifications });
});

export const markRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markRead({ notificationId: req.params.id, userId: req.user.id });
  res.json({ success: true, data: notification });
});
