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
