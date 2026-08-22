import { Router } from 'express';
import * as boardroomController from './boardroom.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createBoardroomSchema, addMemberSchema } from './boardroom.validation.js';

const router = Router();
router.use(authenticate);

router.post('/', validate(createBoardroomSchema), boardroomController.create);
router.get('/', boardroomController.list);
router.get('/:id', boardroomController.getById);
router.get('/:id/messages', boardroomController.getMessages);
router.post('/:id/members', validate(addMemberSchema), boardroomController.addMember);
router.delete('/:id/members/:userId', boardroomController.removeMember);
router.post('/:id/leave', boardroomController.leaveBoardroom);

export default router;
