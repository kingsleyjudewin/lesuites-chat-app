import { Router } from 'express';
import * as conversationController from './conversation.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createConversationSchema } from './conversation.validation.js';

const router = Router();
router.use(authenticate);

router.get('/', conversationController.list);
router.post('/', validate(createConversationSchema), conversationController.create);
