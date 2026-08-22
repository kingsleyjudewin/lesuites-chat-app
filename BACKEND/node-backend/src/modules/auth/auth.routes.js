import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import { registerSchema, loginSchema } from './auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authController.logout);

export default router;
