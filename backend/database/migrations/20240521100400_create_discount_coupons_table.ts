import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('discount_coupons', (table) => {
    table.increments('id').primary();
    table.string('code', 50).notNullable().unique();
    table.decimal('percentage', 5, 2).notNullable();
    table.boolean('active').defaultTo(true);
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('discount_coupons');
}
