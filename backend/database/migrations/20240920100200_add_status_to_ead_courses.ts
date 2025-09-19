import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('ead_courses', (table) => {
    table.string('status').notNullable().defaultTo('active');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('ead_courses', (table) => {
    table.dropColumn('status');
  });
}
