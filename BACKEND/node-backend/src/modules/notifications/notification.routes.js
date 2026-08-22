import { Router } from 'express';
import * as notificationController from './notification.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', notificationController.list);
router.patch('/:id/read', notificationController.markRead);

export default router;
