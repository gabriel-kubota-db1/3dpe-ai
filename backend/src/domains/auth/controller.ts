import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User } from '../users/model.js';
import { sendPasswordResetEmail } from '../../services/EmailService.js';
import { RefreshTokenService } from '../../services/RefreshTokenService.js';
import { generateToken } from '../../utils/jwt.js';

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

    // Generate access token (short-lived)
    const accessToken = generateToken({ id: user.id, role: user.role });
    
    // Generate refresh token (long-lived) and store in database
    const deviceInfo = req.headers['user-agent'] || 'Unknown device';
    const refreshToken = await RefreshTokenService.generateRefreshToken(user.id, deviceInfo as string);

    res.json({ 
      accessToken,
      refreshToken: refreshToken.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error during login', error });
  }
};

// Refresh access token using refresh token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Find and validate refresh token
    const tokenRecord = await RefreshTokenService.findValidToken(refreshToken);
    
    if (!tokenRecord || !tokenRecord.user) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = generateToken({ 
      id: tokenRecord.user.id, 
      role: tokenRecord.user.role 
    });

    // Optionally rotate refresh token (generate new refresh token and revoke old one)
    const deviceInfo = req.headers['user-agent'] || 'Unknown device';
    const newRefreshToken = await RefreshTokenService.generateRefreshToken(
      tokenRecord.user.id, 
      deviceInfo as string
    );
    
    // Revoke the old refresh token
    await RefreshTokenService.revokeToken(refreshToken);

    res.json({
      accessToken,
      refreshToken: newRefreshToken.token,
      user: {
        id: tokenRecord.user.id,
        name: tokenRecord.user.name,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during token refresh', error: error.message });
  }
};

// Logout - revoke refresh token
export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshTokenService.revokeToken(refreshToken);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during logout', error: error.message });
  }
};

// Logout from all devices - revoke all refresh tokens for user
export const logoutAll = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    
    const revokedCount = await RefreshTokenService.revokeAllUserTokens(userId);
    
    res.json({ 
      message: 'Logged out from all devices successfully',
      revokedTokens: revokedCount
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error during logout', error: error.message });
  }
};

// Get active sessions (refresh tokens) for user
export const getActiveSessions = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    
    const activeTokens = await RefreshTokenService.getUserActiveTokens(userId);
    
    const sessions = activeTokens.map(token => ({
      id: token.id,
      deviceInfo: token.device_info,
      createdAt: token.created_at,
      expiresAt: token.expires_at,
    }));

    res.json({ sessions });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error fetching sessions', error: error.message });
  }
};

// Revoke a specific session (refresh token)
export const revokeSession = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { tokenId } = req.params;

    // First verify the token belongs to the current user
    const tokenRecord = await RefreshTokenService.getUserActiveTokens(userId);
    const targetToken = tokenRecord.find(t => t.id === parseInt(tokenId));

    if (!targetToken) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await RefreshTokenService.revokeToken(targetToken.token);

    res.json({ message: 'Session revoked successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error revoking session', error: error.message });
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
    await sendPasswordResetEmail(email, resetToken);

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
    const { token, password } = req.body;

    // Find user with valid reset token
    const user = await User.query()
      .findOne({ reset_password_token: token })
      .where('reset_password_expires', '>', new Date());

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await User.query().patchAndFetchById(Number(user.id), {
      password_hash: hashedPassword,
      reset_password_token: undefined,
      reset_password_expires: undefined,
    });

    // Revoke all existing refresh tokens for security
    await RefreshTokenService.revokeAllUserTokens(Number(user.id));

    res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (error: any) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error during password reset', error: error.message });
  }
};
