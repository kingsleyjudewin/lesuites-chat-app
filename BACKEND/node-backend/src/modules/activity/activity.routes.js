import { Router } from 'express';
import * as activityController from './activity.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/:id', activityController.getUserActivity);
router.get('/:id/sidebar', activityController.getSidebar);

export default router;
