import { Router } from 'express';
import * as boardroomController from './boardroom.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createBoardroomSchema, addMemberSchema } from './boardroom.validation.js';
