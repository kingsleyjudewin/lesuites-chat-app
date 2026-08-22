import { Router } from 'express';
import * as connectionController from './connection.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { sendRequestSchema, respondSchema } from './connection.validation.js';

const router = Router();
router.use(authenticate);
