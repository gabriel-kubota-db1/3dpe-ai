import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('physiotherapists', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('council_acronym', 10).notNullable();
    table.string('council_number', 20).notNullable();
    table.string('council_uf', 2).notNullable();
    table.decimal('loyalty_discount', 5, 2).defaultTo(0.00);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('physiotherapists');
}
