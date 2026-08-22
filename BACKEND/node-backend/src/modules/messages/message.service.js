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

