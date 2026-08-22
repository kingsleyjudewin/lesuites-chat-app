import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const authenticate = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization;
