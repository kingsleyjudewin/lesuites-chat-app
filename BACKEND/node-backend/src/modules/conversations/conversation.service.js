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
