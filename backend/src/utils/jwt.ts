import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export const generateToken = (payload: object) => {
  return jwt.sign(payload, env.JWT_SECRET!, { expiresIn: env.JWT_EXPIRES_IN || '1d' });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, env.JWT_SECRET!, { expiresIn: '7d' });
};

export const generatePasswordResetToken = (payload: object) => {
  return jwt.sign(payload, env.JWT_SECRET!, { expiresIn: '15m' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_SECRET!);
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};
