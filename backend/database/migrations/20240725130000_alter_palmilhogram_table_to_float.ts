import { Knex } from 'knex';

const TABLE_NAME = 'palmilograms';
const COLUMNS = [
  'cic_left', 'cavr_left', 'cavr_total_left', 'cavr_prolonged_left', 'cavl_left', 'cavl_total_left', 'cavl_prolonged_left', 'brc_left', 'boton_left', 'bic_left', 'longitudinal_arch_left',
  'cic_right', 'cavr_right', 'cavr_total_right', 'cavr_prolonged_right', 'cavl_right', 'cavl_total_right', 'cavl_prolonged_right', 'brc_right', 'boton_right', 'bic_right', 'longitudinal_arch_right',
];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    for (const column of COLUMNS) {
      table.decimal(column, 8, 2).nullable().alter();
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    for (const column of COLUMNS) {
      // Reverting to integer. Data loss may occur.
      table.integer(column).nullable().alter();
    }
  });
}
