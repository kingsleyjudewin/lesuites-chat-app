import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

function sign(payload, timestamp) {
  return crypto.createHmac('sha256', env.ENCRYPTION_SERVICE_KEY).update(`${timestamp}.${payload}`).digest('hex');
}

async function call(path, body) {
  const payload = JSON.stringify(body);
  const timestamp = Date.now().toString();
  const signature = sign(payload, timestamp);

  let response;
