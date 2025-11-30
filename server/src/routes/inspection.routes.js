import express from 'express';
import * as inspectionController from '../controllers/inspection.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get(
  '/pending',
  authenticate,
  requireRole('qa_agency'),
  inspectionController.getPendingInspections
);

router.post(
  '/',
  authenticate,
  requireRole('qa_agency'),
  inspectionController.createInspection
);

router.put(
  '/:id',
  authenticate,
  requireRole('qa_agency'),
  inspectionController.updateInspection
);

router.post(
  '/:id/submit',
  authenticate,
  requireRole('qa_agency'),
  inspectionController.submitInspectionResult
);

router.get(
  '/:id',
  authenticate,
  requireRole('qa_agency', 'exporter', 'admin'),
  inspectionController.getInspectionById
);

router.get(
  '/batch/:batchId',
  authenticate,
  requireRole('qa_agency', 'exporter', 'admin'),
  inspectionController.getInspectionByBatch
);

export default router;
