import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../users/user.model.js';
import { RefreshToken } from './auth.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_MS } from '../../config/constants.js';

const BCRYPT_ROUNDS = 12;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

async function issueRefreshToken(userId, meta) {
  const token = crypto.randomBytes(48).toString('hex');
