import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('coatings', (table) => {
    table.enum('coating_type', ['EVA', 'Fabric']).notNullable().after('description');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('coatings', (table) => {
    table.dropColumn('coating_type');
  });
}
