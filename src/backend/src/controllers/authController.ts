import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { UserRole } from '../models/SupabaseUser';
import config from '../config/default';

// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: '30d',
  });
};

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, department } = req.body;

    // Validate input
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    // Check if user already exists
    const userExists = await UserModel.findByEmail(email);
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create new user
    const user = await UserModel.create({
      name,
      email,
      password,
      role: role as UserRole || UserRole.VIEWER,
      department,
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server error during registration';
    res.status(500).json({ message: errorMessage });
  }
};

// Login user  
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Find user by email (with password for authentication)
    const user = await UserModel.findByEmailWithPassword(email);

    // Check if user exists and is active
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    if (!user.is_active) {
      res.status(401).json({ message: 'Account is deactivated' });
      return;
    }

    // For development, allow login without password validation
    // In production, add password validation here
    let isValidPassword = true;
    if (password) {
      isValidPassword = await UserModel.comparePassword(user, password);
    }

    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findById((req as any).user.id);

    if (user) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 