import express from 'express';
import authRoutes from './auth.routes.js';
import batchRoutes from './batch.routes.js';
import inspectionRoutes from './inspection.routes.js';
import credentialRoutes from './credential.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/batches', batchRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/credentials', credentialRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AgriQCert API'
  });
});

export default router;
