import { User } from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { logActivity } from '../activity/activity.service.js';
import { ACTIVITY_TYPE } from '../../config/constants.js';

export async function getById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

export async function updateProfile(userId, updates) {
  const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  await logActivity(userId, ACTIVITY_TYPE.PROFILE_UPDATED);
  return user;
}

export async function search({ q, status, page, limit }) {
  const filter = {};
  if (status) filter.status = status;
  if (q) filter.$text = { $search: q };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(q ? { score: { $meta: 'textScore' } } : { username: 1 }),
    User.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}
