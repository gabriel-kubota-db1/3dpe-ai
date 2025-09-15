import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../users/model.js';
import { env } from '../../config/env.js';
import { generateToken } from '@/utils/jwt.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.query().findOne({ email });

    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  // In a real app, you would generate a token, save it, and email a link.
  // For this example, we'll just simulate the success response.
  const { email } = req.body;
  console.log(`Password reset requested for: ${email}`);
  console.log(`A real implementation would send an email with a reset link.`);
  res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
};

export const resetPassword = async (req: Request, res: Response) => {
  // In a real app, you would verify the token from the request.
  const { token, password } = req.body;
  console.log(`Password reset for token: ${token} with new password.`);
  console.log(`A real implementation would find the user by the token and update their password.`);
  res.json({ message: 'Password has been reset successfully.' });
};
