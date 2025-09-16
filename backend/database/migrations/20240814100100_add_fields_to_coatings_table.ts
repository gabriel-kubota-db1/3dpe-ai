import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('coatings', (table) => {
    table.enum('coating_type', ['EVA', 'Fabric']).notNullable().after('description');
    table.string('number_range', 50).notNullable().after('coating_type');
    table.decimal('cost_value', 10, 2).notNullable().after('number_range');
    table.decimal('sell_value', 10, 2).notNullable().after('cost_value');
    table.integer('weight').notNullable().comment('Weight in grams').after('sell_value');
    table.enum('type', ['INSOLE', 'SLIPPER', 'ELEMENT']).notNullable().after('weight');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('coatings', (table) => {
    table.dropColumn('coating_type');
    table.dropColumn('number_range');
    table.dropColumn('cost_value');
    table.dropColumn('sell_value');
    table.dropColumn('weight');
    table.dropColumn('type');
  });
}
