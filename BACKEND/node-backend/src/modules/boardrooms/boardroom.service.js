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
  if (!boardroom) throw new ApiError(403, 'Only the boardroom owner can perform this action');
  return boardroom;
}

export async function addMember(boardroomId, actingUserId, newUserId) {
  await assertOwner(boardroomId, actingUserId);
  const boardroom = await Boardroom.findOneAndUpdate(
    { _id: boardroomId, 'members.userId': { $ne: newUserId } },
    { $push: { members: { userId: newUserId, role: BOARDROOM_ROLE.MEMBER } } },
    { new: true }
  );
  if (!boardroom) throw new ApiError(409, 'User is already a member');
  await logActivity(newUserId, ACTIVITY_TYPE.JOINED_BOARDROOM, boardroomId);
  return boardroom;
}

export async function removeMember(boardroomId, actingUserId, targetUserId) {
  await assertOwner(boardroomId, actingUserId);
  const boardroom = await Boardroom.findByIdAndUpdate(boardroomId, { $pull: { members: { userId: targetUserId } } }, { new: true });
  if (!boardroom) throw new ApiError(404, 'Boardroom not found');
  await logActivity(targetUserId, ACTIVITY_TYPE.LEFT_BOARDROOM, boardroomId);
  return boardroom;
}

export async function leave(boardroomId, userId) {
  const boardroom = await Boardroom.findById(boardroomId);
  if (!boardroom) throw new ApiError(404, 'Boardroom not found');

  const isOwner = boardroom.members.some((m) => String(m.userId) === String(userId) && m.role === BOARDROOM_ROLE.OWNER);
  if (isOwner && boardroom.members.length > 1) {
    throw new ApiError(400, 'Transfer ownership before leaving, or remove all other members first');
  }

  boardroom.members = boardroom.members.filter((m) => String(m.userId) !== String(userId));
  await boardroom.save();
  await logActivity(userId, ACTIVITY_TYPE.LEFT_BOARDROOM, boardroomId);
  return boardroom;
}
