import Knex from 'knex';
import { Model } from 'objection';
import knexConfig from '../knexfile.js';
import 'dotenv/config';

export function setupDatabase() {
  const env = process.env.NODE_ENV!;
  const config = knexConfig[env];
  
  if (!config) {
    throw new Error(`Knex configuration for environment '${env}' not found.`);
  }

  const knex = Knex(config);
  Model.knex(knex);
  console.log('Database connection established.');
}
