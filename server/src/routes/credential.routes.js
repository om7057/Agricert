import express from 'express';
import * as credentialController from '../controllers/credential.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.post(
  '/issue',
  authenticate,
  requireRole('qa_agency'),
  credentialController.issueCredential
);

router.get(
  '/',
  authenticate,
  requireRole('qa_agency', 'admin'),
  credentialController.getAllCredentials
);

router.get(
  '/statistics',
  authenticate,
  requireRole('admin'),
  credentialController.getStatistics
);

router.get(
  '/:id',
  authenticate,
  credentialController.getCredentialById
);

router.get(
  '/:id/qr',
  authenticate,
  credentialController.getCredentialQR
);

router.post(
  '/:id/revoke',
  authenticate,
  requireRole('qa_agency', 'admin'),
  credentialController.revokeCredential
);

router.get(
  '/:id/revocation-status',
  authenticate,
  credentialController.checkRevocationStatus
);

router.post(
  '/:id/regenerate-qr',
  authenticate,
  requireRole('qa_agency', 'admin'),
  credentialController.regenerateQR
);

router.get(
  '/batch/:batchId',
  authenticate,
  credentialController.getCredentialsByBatch
);

router.post(
  '/verify',
  credentialController.verifyCredential
);

export default router;
