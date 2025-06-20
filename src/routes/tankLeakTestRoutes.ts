import express from 'express';
import {
  createTankLeakTest,
  getAllTankLeakTests,
  getTankLeakTestById,
  updateTankLeakTest,
  deleteTankLeakTest,
} from '../controllers/tankLeakTestController';
// import { protect, restrictTo } from '../middleware/authMiddleware';
// import { UserRole } from '../models/User';

const router = express.Router();

// Get all tank leak tests
router.get('/', getAllTankLeakTests);

// Get tank leak test by ID
router.get('/:id', getTankLeakTestById);

// Create new tank leak test
router.post('/', createTankLeakTest);

// Update tank leak test
router.patch('/:id', updateTankLeakTest);

// Delete tank leak test
router.delete('/:id', deleteTankLeakTest);

export default router; 