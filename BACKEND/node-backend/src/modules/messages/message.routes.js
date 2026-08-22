import { Router } from 'express';
import * as messageController from './message.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { messageLimiter } from '../../middleware/rateLimiter.js';
import { editMessageSchema, reactSchema } from './message.validation.js';

const router = Router();
router.use(authenticate, messageLimiter);

router.patch('/:id', validate(editMessageSchema), messageController.update);
router.delete('/:id', messageController.remove);
