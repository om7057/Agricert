import express from 'express';
import * as batchController from '../controllers/batch.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { uploadMultiple } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post(
  '/',
  authenticate,
  requireRole('exporter'),
  batchController.createBatch
);

router.get(
  '/',
  authenticate,
  batchController.getAllBatches
);

router.get(
  '/:id',
  authenticate,
  batchController.getBatchById
);

router.put(
  '/:id',
  authenticate,
  requireRole('exporter', 'admin'),
  batchController.updateBatch
);

router.delete(
  '/:id',
  authenticate,
  requireRole('exporter', 'admin'),
  batchController.deleteBatch
);

router.post(
  '/:id/attachments',
  authenticate,
  requireRole('exporter'),
  uploadMultiple('files', 10),
  batchController.uploadAttachments
);

router.post(
  '/:id/assign-qa',
  authenticate,
  requireRole('admin'),
  batchController.assignQA
);

export default router;
