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
  await RefreshToken.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });
  return token;
}

export async function register({ username, email, password }, meta) {
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) throw new ApiError(409, 'Username or email already in use');

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await User.create({ username, email, passwordHash });

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id, meta);
  return { user, accessToken, refreshToken };
}

export async function login({ email, password }, meta) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user.id, meta);
  return { user, accessToken, refreshToken };
}

export async function refresh(oldToken, meta) {
  if (!oldToken) throw new ApiError(401, 'Refresh token required');

  const tokenHash = hashToken(oldToken);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    if (stored?.revokedAt) {
