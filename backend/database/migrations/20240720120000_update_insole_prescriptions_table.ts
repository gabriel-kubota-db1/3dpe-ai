import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('insole_prescriptions', (table) => {
    table.text('observations').nullable();
  });
  // In MySQL, altering an ENUM requires a raw query.
  await knex.raw("ALTER TABLE insole_prescriptions MODIFY COLUMN status ENUM('DRAFT', 'ACTIVE', 'CANCELED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT'");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('insole_prescriptions', (table) => {
    table.dropColumn('observations');
  });
  await knex.raw("ALTER TABLE insole_prescriptions MODIFY COLUMN status ENUM('PENDING', 'IN_PRODUCTION', 'COMPLETED', 'DELIVERED') NOT NULL DEFAULT 'PENDING'");
}
