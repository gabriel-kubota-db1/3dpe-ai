import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('ead_lessons', (table) => {
    table.increments('id').primary();
    table.integer('ead_module_id').unsigned().notNullable().references('id').inTable('ead_modules').onDelete('CASCADE');
    table.string('title').notNullable();
    table.string('url').notNullable();
    table.integer('order').notNullable().defaultTo(0);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('ead_lessons');
}
