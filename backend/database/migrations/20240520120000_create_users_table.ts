import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('cpf', 14).notNullable().unique();
    table.boolean('active').defaultTo(true);
    table.date('date_of_birth').nullable();
    table.enum('role', ['admin', 'physiotherapist', 'patient', 'industry']).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('phone', 20).nullable();
    table.string('cep', 9).nullable();
    table.string('state', 2).nullable();
    table.string('city', 100).nullable();
    table.string('street', 255).nullable();
    table.string('number', 20).nullable();
    table.string('complement', 100).nullable();
    table.string('password_hash', 255).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
