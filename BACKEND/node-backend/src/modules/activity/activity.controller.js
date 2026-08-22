import * as activityService from './activity.service.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const getUserActivity = catchAsync(async (req, res) => {
  const feed = await activityService.getFeed(req.params.id);
  res.json({ success: true, data: feed });
});

export const getSidebar = catchAsync(async (req, res) => {
  const data = await activityService.getOnlineSidebar(req.params.id);
  res.json({ success: true, data });
});
