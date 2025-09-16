import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export const generateToken = (payload: object) => {
  return jwt.sign(payload, env.JWT_SECRET!, { expiresIn: env.JWT_EXPIRES_IN || '1d' });
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
