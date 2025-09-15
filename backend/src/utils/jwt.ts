import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: number;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: Number(env.JWT_EXPIRES_IN),
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};
