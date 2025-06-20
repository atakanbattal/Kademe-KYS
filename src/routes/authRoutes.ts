import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController';
// import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Get current user profile
router.get('/me', getCurrentUser);

export default router; 