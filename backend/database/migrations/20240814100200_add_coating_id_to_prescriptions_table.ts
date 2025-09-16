import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Ensure the prescriptions table exists before altering it
  const hasTable = await knex.schema.hasTable('prescriptions');
  if (hasTable) {
    return knex.schema.alterTable('prescriptions', (table) => {
      table.integer('coating_id').unsigned().references('id').inTable('coatings').onDelete('SET NULL').after('insole_model_id');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('prescriptions');
  if (hasTable) {
    return knex.schema.alterTable('prescriptions', (table) => {
      // Check if the column exists before trying to drop it
      knex.schema.hasColumn('prescriptions', 'coating_id').then(exists => {
        if (exists) {
          table.dropForeign('coating_id');
          table.dropColumn('coating_id');
        }
      });
    });
  }
}
