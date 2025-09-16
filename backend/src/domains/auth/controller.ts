import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../users/model.js';
import { env } from '../../config/env.js';
import { generateToken, generatePasswordResetToken, verifyToken } from '../../utils/jwt.js';
import { sendPasswordResetEmail } from '../../services/EmailService.js';

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
  const { email } = req.body;

  try {
    const user = await User.query().findOne({ email });

    if (user) {
      const resetToken = generatePasswordResetToken({ id: user.id });
      await sendPasswordResetEmail(user.email, resetToken);
    }
    
    // Always send a generic success response to prevent user enumeration
    res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    // Do not reveal server errors to the client in this flow
    res.json({ message: 'If a user with that email exists, a password reset link has been sent.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  try {
    const decoded = verifyToken(token);

    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const user = await User.query().findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token.' });
    }

    // The $beforeUpdate hook in the User model will automatically hash the password
    await user.$query().patch({ password });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ message: 'Token has expired.' });
    }
    res.status(500).json({ message: 'An error occurred while resetting the password.' });
  }
};
