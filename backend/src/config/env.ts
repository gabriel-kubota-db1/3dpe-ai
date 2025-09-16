import 'dotenv/config';

export const env = {
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  PORT: process.env.PORT || 3000,
};
