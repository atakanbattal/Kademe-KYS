import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { UserRole } from '../models/SupabaseUser';
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
      const user = await UserModel.findById(decoded.id);
      
      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      if (!user.is_active) {
        res.status(401).json({ message: 'User account is inactive' });
        return;
      }
      
      // Set user in request
      req.user = {
        id: user.id,
        role: user.role as UserRole,
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