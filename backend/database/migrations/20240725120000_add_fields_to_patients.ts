import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('patients', (table) => {
    table.string('responsible_name');
    table.string('responsible_cpf');
    table.string('responsible_phone').nullable();
    table.text('medic_history').nullable();
    table.text('observations').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('patients', (table) => {
    table.dropColumn('cpf');
    table.dropColumn('date_of_birth');
    table.dropColumn('nationality');
    table.dropColumn('naturality');
    table.dropColumn('cep');
    table.dropColumn('state');
    table.dropColumn('city');
    table.dropColumn('street');
    table.dropColumn('number');
    table.dropColumn('complement');
    table.dropColumn('responsible_phone');
    table.dropColumn('medic_history');
    table.dropColumn('observations');
  });
}
