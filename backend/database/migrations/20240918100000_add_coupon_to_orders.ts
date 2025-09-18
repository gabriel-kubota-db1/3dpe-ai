import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', (table) => {
    table.decimal('discount_value', 10, 2).defaultTo(0.00).after('freight_value');
    table.integer('coupon_id').unsigned().nullable().references('id').inTable('coupons').onDelete('SET NULL').after('discount_value');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('orders', (table) => {
    table.dropColumn('discount_value');
    table.dropForeign('coupon_id');
    table.dropColumn('coupon_id');
  });
}
