import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('ead_lessons', (table) => {
    table.integer('duration').unsigned().nullable().comment('Duration in seconds');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('ead_lessons', (table) => {
    table.dropColumn('duration');
  });
}
