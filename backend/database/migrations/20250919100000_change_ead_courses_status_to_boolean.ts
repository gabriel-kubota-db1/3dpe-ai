import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // First, add a temporary boolean column
  await knex.schema.alterTable('ead_courses', (table) => {
    table.boolean('status_temp').notNullable().defaultTo(true);
  });

  // Convert existing string values to boolean values
  // 'active' -> true, 'inactive' -> false
  await knex.raw(`
    UPDATE ead_courses 
    SET status_temp = CASE 
      WHEN status = 'active' THEN 1 
      ELSE 0 
    END
  `);

  // Drop the old string column
  await knex.schema.alterTable('ead_courses', (table) => {
    table.dropColumn('status');
  });

  // Rename the temporary column to 'status'
  await knex.schema.alterTable('ead_courses', (table) => {
    table.renameColumn('status_temp', 'status');
  });
}

export async function down(knex: Knex): Promise<void> {
  // First, add a temporary string column
  await knex.schema.alterTable('ead_courses', (table) => {
    table.string('status_temp').notNullable().defaultTo('active');
  });

  // Convert boolean values back to string values
  // true -> 'active', false -> 'inactive'
  await knex.raw(`
    UPDATE ead_courses 
    SET status_temp = CASE 
      WHEN status = 1 THEN 'active' 
      ELSE 'inactive' 
    END
  `);

  // Drop the boolean column
  await knex.schema.alterTable('ead_courses', (table) => {
    table.dropColumn('status');
  });

  // Rename the temporary column to 'status'
  await knex.schema.alterTable('ead_courses', (table) => {
    table.renameColumn('status_temp', 'status');
  });
}
