import { Router } from 'express';
import * as presenceController from './presence.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { setStatusSchema } from './presence.validation.js';

const router = Router();
