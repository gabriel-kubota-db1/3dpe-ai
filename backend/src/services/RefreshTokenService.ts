import crypto from 'crypto';
import { RefreshToken } from '../domains/auth/refreshTokenModel.js';
import { env } from '../config/env.js';

export class RefreshTokenService {
  // Generate a new refresh token for a user
  static async generateRefreshToken(
    userId: number, 
    deviceInfo?: string
  ): Promise<RefreshToken> {
    // Generate a random token string
    const tokenString = crypto.randomBytes(64).toString('hex');
    
    // Calculate expiry date (7 days from now by default)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create refresh token in database
    const refreshToken = await RefreshToken.query().insert({
      user_id: userId,
      token: tokenString,
      expires_at: expiresAt,
      device_info: deviceInfo,
    });

    return refreshToken;
  }

  // Revoke a specific refresh token
  static async revokeToken(tokenString: string): Promise<boolean> {
    const result = await RefreshToken.query()
      .patch({ is_revoked: true })
      .where('token', tokenString);
    
    return result > 0;
  }

  // Revoke all refresh tokens for a user
  static async revokeAllUserTokens(userId: number): Promise<number> {
    return await RefreshToken.query()
      .patch({ is_revoked: true })
      .where('user_id', userId)
      .where('is_revoked', false);
  }

  // Find a valid refresh token
  static async findValidToken(tokenString: string): Promise<RefreshToken | null> {
    const refreshToken = await RefreshToken.query()
      .findOne({ token: tokenString })
      .where('is_revoked', false)
      .withGraphFetched('user');

    if (!refreshToken || refreshToken.isExpired()) {
      return null;
    }

    return refreshToken;
  }

  // Clean up expired tokens (can be called periodically)
  static async cleanupExpiredTokens(): Promise<number> {
    return await RefreshToken.query()
      .delete()
      .where('expires_at', '<', new Date())
      .orWhere('is_revoked', true);
  }

  // Get all active refresh tokens for a user
  static async getUserActiveTokens(userId: number): Promise<RefreshToken[]> {
    return await RefreshToken.query()
      .where('user_id', userId)
      .where('is_revoked', false)
      .where('expires_at', '>', new Date())
      .orderBy('created_at', 'desc');
  }

  // Clean up expired password reset tokens from users table
  static async cleanupExpiredPasswordResetTokens(): Promise<number> {
    const { User } = await import('../domains/users/model.js');
    return await User.query()
      .patch({
        reset_password_token: undefined,
        reset_password_expires: undefined,
      })
      .where('reset_password_expires', '<', new Date());
  }
}
