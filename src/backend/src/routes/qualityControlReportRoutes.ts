import express from 'express';
import {
  createQualityControlReport,
  getAllQualityControlReports,
  getQualityControlReportById,
  updateQualityControlReport,
  deleteQualityControlReport,
  getReportsStatistics,
} from '../controllers/qualityControlReportController';
// import { protect, restrictTo } from '../middleware/authMiddleware';
// import { UserRole } from '../models/User';

const router = express.Router();

// Get all quality control reports
router.get('/', getAllQualityControlReports);

// Get reports statistics
router.get('/statistics', getReportsStatistics);

// Get quality control report by ID
router.get('/:id', getQualityControlReportById);

// Create new quality control report
router.post('/', createQualityControlReport);

// Update quality control report
router.put('/:id', updateQualityControlReport);

// Delete quality control report
router.delete('/:id', deleteQualityControlReport);

export default router; 