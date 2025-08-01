import express from 'express';
import {
  createDeviationApproval,
  getDeviationApprovals,
  getDeviationApprovalById,
  updateDeviationApproval,
  deleteDeviationApproval,
  approveDeviation,
  rejectDeviation,
  getDashboardStats,
  bulkUpdateStatus
} from '../controllers/deviationApprovalController';

const router = express.Router();

// Dashboard and statistics
router.get('/dashboard', getDashboardStats);

// Bulk operations
router.patch('/bulk/status', bulkUpdateStatus);

// Main CRUD operations
router.get('/', getDeviationApprovals);
router.post('/', createDeviationApproval);
router.get('/:id', getDeviationApprovalById);
router.patch('/:id', updateDeviationApproval);
router.delete('/:id', deleteDeviationApproval);

// Approval workflow operations
router.patch('/:id/approve', approveDeviation);
router.patch('/:id/reject', rejectDeviation);

export default router;