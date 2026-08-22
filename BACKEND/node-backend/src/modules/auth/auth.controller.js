import * as authService from './auth.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { env } from '../../config/env.js';

const REFRESH_COOKIE = 'refreshToken';
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  signed: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

function meta(req) {
  return { userAgent: req.headers['user-agent'] || '', ip: req.ip };
}

function respondWithAuth(res, { user, accessToken, refreshToken }, status = 200) {
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  res.status(status).json({ success: true, data: { user, accessToken } });
}
