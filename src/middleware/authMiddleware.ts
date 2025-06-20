import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { UserRole, IUser } from '../models/User';
import config from '../config/default';

// Interface to extend Express Request
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

// Middleware to protect routes
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password') as IUser | null;
      
      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      if (!user.isActive) {
        res.status(401).json({ message: 'User account is inactive' });
        return;
      }

      const userId = (user._id as mongoose.Types.ObjectId).toString();
      
      // Set user in request
      req.user = {
        id: userId,
        role: user.role,
      };

      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to restrict access based on role
export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: 'You do not have permission to perform this action',
      });
      return;
    }

    next();
  };
}; 