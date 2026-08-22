import { User } from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { logActivity } from '../activity/activity.service.js';
import { ACTIVITY_TYPE } from '../../config/constants.js';

export async function getById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
