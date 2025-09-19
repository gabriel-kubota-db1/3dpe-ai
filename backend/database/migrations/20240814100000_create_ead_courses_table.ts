import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('ead_courses', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('category').notNullable();
    table.text('description');
    table.string('cover_url');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('ead_courses');
}
