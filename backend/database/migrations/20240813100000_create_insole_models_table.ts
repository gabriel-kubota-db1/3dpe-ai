import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('insole_models', (table) => {
    table.increments('id').primary();
    table.string('description', 255).notNullable();
    table.string('type', 100).notNullable();
    table.string('numeration', 50).notNullable();
    table.enum('coating_type', ['eva', 'fabric']).notNullable();
    table.integer('eva_coating_id').unsigned().nullable().references('id').inTable('coatings');
    table.integer('fabric_coating_id').unsigned().nullable().references('id').inTable('coatings');
    table.decimal('cost_value', 10, 2).notNullable();
    table.decimal('sale_value', 10, 2).notNullable();
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('insole_models');
}
