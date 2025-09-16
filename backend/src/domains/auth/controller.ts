import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../users/model.js';
import { generateToken, generateRefreshToken, generatePasswordResetToken, verifyToken } from '../../utils/jwt.js';
import { sendPasswordResetEmail } from '../../services/EmailService.js';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Fetch user with all profile fields
    const user = await User.query()
      .findOne({ email })
      .select('id', 'name', 'email', 'role', 'active', 'document', 'phone', 'cep', 'state', 'city', 'street', 'number', 'complement', 'date_of_birth', 'password_hash');

    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    // Remove password_hash from response
    const { password_hash, ...userResponse } = user;

    res.json({ token, refreshToken, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = verifyToken(refreshToken);

    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Fetch user with all profile fields
    const user = await User.query()
      .findById(decoded.id)
      .select('id', 'name', 'email', 'role', 'active', 'document', 'phone', 'cep', 'state', 'city', 'street', 'number', 'complement', 'date_of_birth');

    if (!user || !user.active) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    const newToken = generateToken({ id: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });

    res.json({ token: newToken, refreshToken: newRefreshToken, user });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
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
  const { token, password, confirmPassword } = req.body;

  try {
    const decoded = verifyToken(token);

    if (!decoded || typeof decoded !== 'object' || !decoded.id) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const user = await User.query().findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Hash the password before updating to avoid issues with the $beforeUpdate hook
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.$query().patch({ password_hash: hashedPassword });

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ message: 'Token has expired.' });
    }
    res.status(500).json({ message: 'An error occurred while resetting the password.' });
  }
};
