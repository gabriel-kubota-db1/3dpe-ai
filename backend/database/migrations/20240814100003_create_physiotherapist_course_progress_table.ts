import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('physiotherapist_course_progress', (table) => {
    table.increments('id').primary();
    table.integer('physiotherapist_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('ead_course_id').unsigned().notNullable().references('id').inTable('ead_courses').onDelete('CASCADE');
    table.json('completed_lessons').nullable();
    table.decimal('progress', 5, 2).defaultTo(0.00);
    table.enum('status', ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).defaultTo('NOT_STARTED');
    table.integer('evaluation').nullable(); // e.g., 1 to 5 stars
    table.text('evaluation_comment').nullable();
    table.timestamps(true, true);
    table.unique(['physiotherapist_id', 'ead_course_id'], 'physio_course_progress_unique');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('physiotherapist_course_progress');
}
