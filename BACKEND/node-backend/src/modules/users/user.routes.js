import { Router } from 'express';
import * as userController from './user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { updateProfileSchema, listUsersQuerySchema } from './user.validation.js';

const router = Router();
router.use(authenticate);
