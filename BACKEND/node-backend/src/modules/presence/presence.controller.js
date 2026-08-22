import * as presenceService from './presence.service.js';
import { User } from '../users/user.model.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { ApiError } from '../../utils/ApiError.js';

export const getStatus = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId).select('status lastSeen');
  if (!user) throw new ApiError(404, 'User not found');
