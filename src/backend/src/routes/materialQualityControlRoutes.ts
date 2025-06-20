import express from 'express';
import {
  createMaterialQualityControl,
  getAllMaterialQualityControls,
  getMaterialQualityControlById,
  updateMaterialQualityControlStatus,
  updateCertificateProperties,
  deleteMaterialQualityControl,
} from '../controllers/materialQualityControlController';
// import { protect, restrictTo } from '../middleware/authMiddleware';
// import { UserRole } from '../models/User';

const router = express.Router();

// Get all material quality controls
router.get('/', getAllMaterialQualityControls);

// Get material quality control by ID
router.get('/:id', getMaterialQualityControlById);

// Create new material quality control
router.post('/', createMaterialQualityControl);

// Update material quality control status
router.patch('/:id/status', updateMaterialQualityControlStatus);

// Update certificate properties
router.patch('/:id/certificate', updateCertificateProperties);

// Delete material quality control
router.delete('/:id', deleteMaterialQualityControl);

export default router; 