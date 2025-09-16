import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('coupons', (table) => {
    table.increments('id').primary();
    table.string('code').unique().notNullable();
    table.decimal('value', 5, 2).notNullable().comment('Discount percentage');
    table.date('start_date').notNullable();
    table.date('finish_date').notNullable();
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('coupons');
}
