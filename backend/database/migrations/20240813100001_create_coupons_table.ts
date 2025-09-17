import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('coupons', (table) => {
    table.increments('id').primary();
    table.string('code').unique().notNullable();
    table.enum('discount_type', ['percentage', 'fixed']).notNullable();
    table.decimal('value', 10, 2).notNullable();
    table.date('expiry_date').notNullable();
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('coupons');
}
