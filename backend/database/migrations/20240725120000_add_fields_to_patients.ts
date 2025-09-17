import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('patients', (table) => {
    // Fields from previous migration
    table.string('cpf').nullable();
    table.date('date_of_birth').nullable();
    
    // Fields from this migration
    table.string('nationality').nullable();
    table.string('naturality').nullable();
    table.string('cep', 9).nullable();
    table.string('state', 2).nullable();
    table.string('city').nullable();
    table.string('street').nullable();
    table.string('number').nullable();
    table.string('complement').nullable();
    table.string('responsible_phone').nullable();

    // New fields
    table.text('medic_history').nullable();
    table.text('observations').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('patients', (table) => {
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
