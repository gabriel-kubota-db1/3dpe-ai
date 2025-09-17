import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Patients Table
  await knex.schema.createTable('patients', (table) => {
    table.increments('id').primary();
    table.integer('physiotherapist_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('email').unique();
    table.string('phone');
    table.string('cpf').unique();
    table.string('rg');
    table.date('date_of_birth');
    table.string('nationality');
    table.string('naturality'); // City of birth
    table.string('cep');
    table.string('state', 2);
    table.string('city');
    table.string('street');
    table.string('number');
    table.string('complement');
    table.timestamps(true, true);
  });

  // Patient Audit Logs Table
  await knex.schema.createTable('patient_audit_logs', (table) => {
    table.increments('id').primary();
    table.integer('patient_id').unsigned().notNullable().references('id').inTable('patients').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
    table.enum('action', ['CREATED', 'UPDATED']).notNullable();
    table.json('old_data').nullable();
    table.json('new_data').notNullable();
    table.timestamp('changed_at').defaultTo(knex.fn.now());
  });

  // Palmilhograms Table
  await knex.schema.createTable('palmilograms', (table) => {
    table.increments('id').primary();
    // Left Foot
    table.boolean('cic_left').defaultTo(false);
    table.integer('cic_left_value').nullable();
    table.boolean('cavr_left').defaultTo(false);
    table.integer('cavr_left_value').nullable();
    table.boolean('medial_longitudinal_arch_left').defaultTo(false);
    table.integer('medial_longitudinal_arch_left_value').nullable();
    table.boolean('lateral_longitudinal_arch_left').defaultTo(false);
    table.integer('lateral_longitudinal_arch_left_value').nullable();
    table.boolean('transverse_arch_left').defaultTo(false);
    table.integer('transverse_arch_left_value').nullable();
    table.boolean('calcaneus_left').defaultTo(false);
    table.integer('calcaneus_left_value').nullable();
    // Right Foot
    table.boolean('cic_right').defaultTo(false);
    table.integer('cic_right_value').nullable();
    table.boolean('cavr_right').defaultTo(false);
    table.integer('cavr_right_value').nullable();
    table.boolean('medial_longitudinal_arch_right').defaultTo(false);
    table.integer('medial_longitudinal_arch_right_value').nullable();
    table.boolean('lateral_longitudinal_arch_right').defaultTo(false);
    table.integer('lateral_longitudinal_arch_right_value').nullable();
    table.boolean('transverse_arch_right').defaultTo(false);
    table.integer('transverse_arch_right_value').nullable();
    table.boolean('calcaneus_right').defaultTo(false);
    table.integer('calcaneus_right_value').nullable();
    
    table.text('observations').nullable();
    table.timestamps(true, true);
  });

  // Insole Prescriptions Table
  await knex.schema.createTable('insole_prescriptions', (table) => {
    table.increments('id').primary();
    table.integer('patient_id').unsigned().notNullable().references('id').inTable('patients').onDelete('CASCADE');
    table.integer('insole_model_id').unsigned().notNullable().references('id').inTable('insole_models');
    table.integer('palmilhogram_id').unsigned().notNullable().references('id').inTable('palmilograms').onDelete('CASCADE');
    table.string('numeration').notNullable(); // Shoe size
    table.enum('status', ['PENDING', 'IN_PRODUCTION', 'COMPLETED', 'DELIVERED']).defaultTo('PENDING');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('insole_prescriptions');
  await knex.schema.dropTableIfExists('palmilograms');
  await knex.schema.dropTableIfExists('patient_audit_logs');
  await knex.schema.dropTableIfExists('patients');
}
