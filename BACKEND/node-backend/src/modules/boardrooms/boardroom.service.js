import { Boardroom } from './boardroom.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { BOARDROOM_ROLE, ACTIVITY_TYPE } from '../../config/constants.js';
import { logActivity } from '../activity/activity.service.js';

export async function create(creatorId, { name, description, memberIds = [] }) {
  const memberSet = new Set([creatorId, ...memberIds]);
  const members = [...memberSet].map((userId) => ({
    userId,
    role: userId === creatorId ? BOARDROOM_ROLE.OWNER : BOARDROOM_ROLE.MEMBER,
  }));

  const boardroom = await Boardroom.create({ name, description, creatorId, members });
  await logActivity(creatorId, ACTIVITY_TYPE.JOINED_BOARDROOM, boardroom.id);
  return boardroom;
}

export async function listForUser(userId) {
  return Boardroom.find({ 'members.userId': userId }).sort({ updatedAt: -1 });
