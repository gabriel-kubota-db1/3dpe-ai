import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../users/model.js';
import { env } from '../../config/env.js';
import { emailService } from '../../services/EmailService.js';
import bcrypt from 'bcryptjs';

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

    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET!, {
      expiresIn: Number(env.JWT_EXPIRES_IN),
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.query().findOne({ email });

    // Always return success message to prevent email enumeration
    if (!user) {
      return res.json({
        message: 'If a user with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to database
    await User.query().patchAndFetchById(user.id, {
      reset_password_token: resetToken,
      reset_password_expires: resetTokenExpiry,
    });

    // Send email
    await emailService.sendPasswordResetEmail(email, resetToken);

    res.json({
      message: 'If a user with that email exists, a password reset link has been sent.'
    });
  } catch (error: any) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Server error during password reset request', error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Find user with valid reset token
    const user = await User.query()
      .findOne({ reset_password_token: token })
      .where('reset_password_expires', '>', new Date());

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Hash the password before updating to avoid issues with the $beforeUpdate hook
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.$query().patch({ password_hash: hashedPassword });

    // Send confirmation email
    await emailService.sendPasswordResetConfirmation(user.email);

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error: any) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error during password reset', error: error.message });
  }
};
