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
}

export async function getById(boardroomId) {
  const boardroom = await Boardroom.findById(boardroomId).populate('members.userId', 'username avatarUrl status title');
  if (!boardroom) throw new ApiError(404, 'Boardroom not found');
  return boardroom;
}

export async function assertMember(boardroomId, userId) {
  const boardroom = await Boardroom.findOne({ _id: boardroomId, 'members.userId': userId });
  if (!boardroom) throw new ApiError(403, 'Not a member of this boardroom');
  return boardroom;
}

export async function assertOwner(boardroomId, userId) {
  const boardroom = await Boardroom.findOne({
    _id: boardroomId,
    members: { $elemMatch: { userId, role: BOARDROOM_ROLE.OWNER } },
  });
