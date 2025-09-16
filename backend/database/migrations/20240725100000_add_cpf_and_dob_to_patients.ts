import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('patients', (table) => {
    table.string('cpf').nullable().after('phone');
    table.date('date_of_birth').nullable().after('rg');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('patients', (table) => {
    table.dropColumn('cpf');
    table.dropColumn('date_of_birth');
  });
}
