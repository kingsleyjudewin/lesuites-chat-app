import crypto from 'node:crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileAttachment } from './file.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';
import * as conversationService from '../conversations/conversation.service.js';
import * as boardroomService from '../boardrooms/boardroom.service.js';
import { CONTEXT_TYPE } from '../../config/constants.js';

const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT || undefined,
  forcePathStyle: Boolean(env.S3_ENDPOINT), // required for MinIO-style endpoints used in local dev
  credentials: env.S3_ACCESS_KEY_ID
    ? { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY }
    : undefined,
});

async function assertAccess(contextType, contextId, userId) {
  if (contextType === CONTEXT_TYPE.CONVERSATION) return conversationService.assertParticipant(contextId, userId);
  return boardroomService.assertMember(contextId, userId);
}

export async function createPresignedUpload(userId, { contextType, contextId, fileName, mimeType, size }) {
  await assertAccess(contextType, contextId, userId);

  const storageKey = `${contextType}/${contextId}/${crypto.randomUUID()}-${fileName}`;
