import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop the incorrect columns if they exist from the previous incorrect migration
  const hasNumberRange = await knex.schema.hasColumn('coatings', 'number_range');
  if (hasNumberRange) {
    await knex.schema.alterTable('coatings', (table) => {
      table.dropColumn('number_range');
      table.dropColumn('cost_value');
      table.dropColumn('sell_value');
      table.dropColumn('weight');
      table.dropColumn('type');
    });
  }

  // Add the correct column
  return knex.schema.alterTable('coatings', (table) => {
    table.enum('coating_type', ['EVA', 'Fabric']).notNullable().after('description');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('coatings', (table) => {
    table.dropColumn('coating_type');
  });
}
