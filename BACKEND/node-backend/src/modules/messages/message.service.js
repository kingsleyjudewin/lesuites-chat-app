import { Message } from './message.model.js';
import { ApiError } from '../../utils/ApiError.js';
import * as encryptionClient from '../../services/encryptionClient.js';
import * as conversationService from '../conversations/conversation.service.js';
import * as boardroomService from '../boardrooms/boardroom.service.js';
import { CONTEXT_TYPE, MESSAGE_STATUS } from '../../config/constants.js';

async function assertAccess(contextType, contextId, userId) {
  if (contextType === CONTEXT_TYPE.CONVERSATION) return conversationService.assertParticipant(contextId, userId);
  return boardroomService.assertMember(contextId, userId);
}

export async function sendMessage({ senderId, contextType, contextId, text }) {
  await assertAccess(contextType, contextId, senderId);

  const { ciphertext, keyVersion } = await encryptionClient.encrypt(text);
  const message = await Message.create({ contextType, contextId, senderId, ciphertext, keyVersion });

  return { ...message.toJSON(), text };
}

export async function listMessages({ contextType, contextId, userId, cursor, limit = 30 }) {
  await assertAccess(contextType, contextId, userId);

  const filter = { contextType, contextId, deletedAt: null };
  if (cursor) filter._id = { $lt: cursor };

  const messages = await Message.find(filter).sort({ _id: -1 }).limit(limit);
  const decrypted = messages.length
    ? await encryptionClient.decryptBatch(messages.map((m) => ({ ciphertext: m.ciphertext, keyVersion: m.keyVersion })))
    : [];

  return messages.map((m, i) => ({ ...m.toJSON(), text: decrypted[i]?.plaintext })).reverse();
}

export async function editMessage({ messageId, userId, text }) {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');
  if (String(message.senderId) !== String(userId)) throw new ApiError(403, "Cannot edit another member's message");

  const { ciphertext, keyVersion } = await encryptionClient.encrypt(text);
  message.ciphertext = ciphertext;
  message.keyVersion = keyVersion;
  message.editedAt = new Date();
  await message.save();

  return { room: `${message.contextType}:${message.contextId}`, message: { ...message.toJSON(), text } };
}

export async function deleteMessage({ messageId, userId }) {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');
  if (String(message.senderId) !== String(userId)) throw new ApiError(403, "Cannot delete another member's message");

  message.deletedAt = new Date();
  await message.save();
  return { room: `${message.contextType}:${message.contextId}`, messageId: message.id };
}

export async function markSeen({ messageId, userId }) {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');

  const alreadySeen = message.readBy.some((r) => String(r.userId) === String(userId));
  if (!alreadySeen) {
    message.readBy.push({ userId, seenAt: new Date() });
    if (message.status !== MESSAGE_STATUS.SEEN) message.status = MESSAGE_STATUS.SEEN;
    await message.save();
  }

  return { message, room: `${message.contextType}:${message.contextId}` };
}

export async function react({ messageId, userId, type }) {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');

  message.reactions = message.reactions.filter((r) => String(r.userId) !== String(userId));
  message.reactions.push({ userId, type });
  await message.save();

  return { room: `${message.contextType}:${message.contextId}`, message };
}
