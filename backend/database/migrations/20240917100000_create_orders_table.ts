import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.timestamp('order_date').defaultTo(knex.fn.now());
    table.enum('status', [
      'PENDING_PAYMENT', 
      'PROCESSING', 
      'IN_PRODUCTION', 
      'SHIPPED', 
      'COMPLETED', 
      'CANCELED'
    ]).notNullable().defaultTo('PENDING_PAYMENT');
    table.integer('physiotherapist_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('observations').nullable();
    table.string('payment_method').nullable();
    table.decimal('order_value', 10, 2).notNullable();
    table.decimal('freight_value', 10, 2).notNullable();
    table.decimal('total_value', 10, 2).notNullable();
    table.string('gateway_id').nullable();
    table.timestamp('transaction_date').nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('order_prescriptions', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().notNullable().references('id').inTable('orders').onDelete('CASCADE');
    table.integer('insole_prescription_id').unsigned().notNullable().references('id').inTable('insole_prescriptions').onDelete('CASCADE');
    table.unique(['order_id', 'insole_prescription_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_prescriptions');
  await knex.schema.dropTableIfExists('orders');
}
