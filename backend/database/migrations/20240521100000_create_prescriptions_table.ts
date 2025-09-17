import type { Knex } from 'knex';

const palmilhogramParameters = [
  'cic', 'cavr', 'cavr_total', 'cavr_prolonged',
  'cavl_total', 'cavl', 'cavl_prolonged', 'brc',
  'boton', 'bic', 'longitudinal_arch'
];

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('prescriptions', (table) => {
    table.increments('id').primary();
    
    table.integer('patient_id').unsigned().notNullable();
    table.foreign('patient_id').references('id').inTable('users').onDelete('CASCADE');

    table.integer('physiotherapist_id').unsigned().notNullable();
    table.foreign('physiotherapist_id').references('id').inTable('users').onDelete('CASCADE');

    table.integer('insole_model_id').unsigned().notNullable();
    table.foreign('insole_model_id').references('id').inTable('insole_models').onDelete('CASCADE');

    table.string('shoe_size').notNullable();
    table.enum('status', ['draft', 'active', 'canceled', 'completed']).notNullable().defaultTo('draft');
    table.text('observation').nullable();

    // Palmilhograma fields
    palmilhogramParameters.forEach(param => {
      table.decimal(`${param}_left`, 5, 2).nullable();
      table.decimal(`${param}_right`, 5, 2).nullable();
    });

    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('prescriptions');
}
