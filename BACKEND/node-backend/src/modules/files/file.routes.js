import { Router } from 'express';
import * as fileController from './file.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { presignSchema, confirmUploadSchema } from './file.validation.js';

const router = Router();
router.use(authenticate);

router.post('/presign', validate(presignSchema), fileController.presign);
router.post('/', validate(confirmUploadSchema), fileController.confirm);
router.get('/:id/download-url', fileController.downloadUrl);
