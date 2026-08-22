import { Conversation } from './conversation.model.js';
import { Message } from '../messages/message.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { CONVERSATION_TYPE, CONTEXT_TYPE } from '../../config/constants.js';
import * as encryptionClient from '../../services/encryptionClient.js';

export async function listForUser(userId) {
  const conversations = await Conversation.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .populate('participants', 'username avatarUrl status lastSeen');

  const lastMessages = await Promise.all(
    conversations.map((c) =>
      Message.findOne({ contextType: CONTEXT_TYPE.CONVERSATION, contextId: c._id, deletedAt: null }).sort({ createdAt: -1 })
    )
  );

  const withMessage = lastMessages.map((m, i) => ({ m, i })).filter(({ m }) => m);
  const decrypted = withMessage.length
    ? await encryptionClient.decryptBatch(withMessage.map(({ m }) => ({ ciphertext: m.ciphertext, keyVersion: m.keyVersion })))
    : [];
  const previewByIndex = new Map(withMessage.map(({ i }, idx) => [i, decrypted[idx]?.plaintext]));

  return conversations.map((c, i) => {
    const last = lastMessages[i];
    return {
      ...c.toJSON(),
      lastMessage: last ? { text: previewByIndex.get(i), senderId: last.senderId, createdAt: last.createdAt } : null,
    };
  });
}

export async function getOrCreateDirect(userId, otherUserId) {
  if (userId === otherUserId) throw new ApiError(400, 'Cannot start a conversation with yourself');

  let conversation = await Conversation.findOne({
    type: CONVERSATION_TYPE.DIRECT,
    participants: { $all: [userId, otherUserId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({ type: CONVERSATION_TYPE.DIRECT, participants: [userId, otherUserId] });
  }
