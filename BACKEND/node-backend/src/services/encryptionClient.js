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
  try {
    response = await fetch(`${env.ENCRYPTION_SERVICE_URL}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-service-timestamp': timestamp,
        'x-service-signature': signature,
      },
      body: payload,
    });
  } catch {
    throw new ApiError(503, 'Encryption service unavailable');
  }

  if (!response.ok) {
    throw new ApiError(503, 'Encryption service error');
  }

  return response.json();
}

// Node never falls back to storing plaintext if this service is unreachable — callers must let the ApiError propagate.
export async function encrypt(plaintext) {
  return call('/encrypt', { plaintext }); // { ciphertext, keyVersion }
}

export async function decrypt(ciphertext, keyVersion) {
