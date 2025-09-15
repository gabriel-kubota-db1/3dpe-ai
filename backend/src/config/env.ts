import dotenv from 'dotenv';

dotenv.config({ path: "../.env"});

export const env = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  CLIENT_URL: process.env.CLIENT_URL,
  PORT: process.env.PORT,
};
