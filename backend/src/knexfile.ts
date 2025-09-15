import type { Knex } from 'knex';
import { config as configDotenv } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the backend root directory
configDotenv({ path: join(__dirname, '../.env') });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
    migrations: {
      directory: '../database/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: '../database/seeds',
      extension: 'ts',
    },
  },
};

export default config;
