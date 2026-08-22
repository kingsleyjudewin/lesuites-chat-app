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
  const command = new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: storageKey, ContentType: mimeType, ContentLength: size });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return { uploadUrl, storageKey };
}

export async function confirmUpload(userId, data) {
  await assertAccess(data.contextType, data.contextId, userId);
  return FileAttachment.create({ uploaderId: userId, ...data });
}

export async function getDownloadUrl(userId, fileId) {
  const file = await FileAttachment.findById(fileId);
  if (!file) throw new ApiError(404, 'File not found');
  await assertAccess(file.contextType, file.contextId, userId);

  const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: file.storageKey });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

export async function remove(userId, fileId) {
  const file = await FileAttachment.findById(fileId);
  if (!file) throw new ApiError(404, 'File not found');
  if (String(file.uploaderId) !== String(userId)) throw new ApiError(403, 'Only the uploader can delete this file');

  await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: file.storageKey }));
  await file.deleteOne();
}
