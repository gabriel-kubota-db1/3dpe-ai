import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if the column exists before trying to drop it.
  const hasCategoryColumn = await knex.schema.hasColumn('ead_courses', 'category');

  return knex.schema.alterTable('ead_courses', (table) => {
    if (hasCategoryColumn) {
      table.dropColumn('category');
    }
    table.integer('category_id').unsigned().references('id').inTable('ead_categories').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('ead_courses', (table) => {
    table.dropForeign('category_id');
    table.dropColumn('category_id');
    table.string('category');
  });
}
