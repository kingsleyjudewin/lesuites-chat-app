import { Router } from 'express';
import * as activityController from './activity.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);
