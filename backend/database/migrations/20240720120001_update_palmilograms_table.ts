import { Knex } from 'knex';

const fieldsToRename = [
  'cic_left', 'cavr_left', 'medial_longitudinal_arch_left', 'lateral_longitudinal_arch_left', 'transverse_arch_left', 'calcaneus_left',
  'cic_right', 'cavr_right', 'medial_longitudinal_arch_right', 'lateral_longitudinal_arch_right', 'transverse_arch_right', 'calcaneus_right'
];

const newFields = [
    'brc_left', 'cavr_total_left', 'cavr_prolonged_left', 'cavl_left', 'cavl_total_left', 'cavl_prolonged_left', 'boton_left', 'bic_left', 'longitudinal_arch_left',
    'brc_right', 'cavr_total_right', 'cavr_prolonged_right', 'cavl_right', 'cavl_total_right', 'cavl_prolonged_right', 'boton_right', 'bic_right', 'longitudinal_arch_right'
];

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('palmilograms', (table) => {
    // 1. Drop old boolean fields that are being replaced by nullable number fields
    const columnsToDrop = [
        'medial_longitudinal_arch_left', 'lateral_longitudinal_arch_left', 'transverse_arch_left', 'calcaneus_left',
        'medial_longitudinal_arch_right', 'lateral_longitudinal_arch_right', 'transverse_arch_right', 'calcaneus_right'
    ];
    table.dropColumns(...columnsToDrop);

    // 2. Drop the corresponding _value fields
    const valueColumnsToDrop = columnsToDrop.map(c => `${c}_value`);
    table.dropColumns(...valueColumnsToDrop);

    // 3. Rename existing _value fields to simple names and drop boolean flags
    for (const field of ['cic_left', 'cavr_left', 'cic_right', 'cavr_right']) {
        table.dropColumn(field);
        if (await knex.schema.hasColumn('palmilograms', `${field}_value`)) {
            table.renameColumn(`${field}_value`, field);
        } else {
            table.decimal(field, 8, 2).nullable();
        }
    }

    // 4. Add all new nullable decimal fields
    for (const field of newFields) {
        table.decimal(field, 8, 2).nullable();
    }
  });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('palmilograms', (table) => {
        // 1. Revert renaming and re-add boolean flags
        for (const field of ['cic_left', 'cavr_left', 'cic_right', 'cavr_right']) {
            table.renameColumn(field, `${field}_value`);
            table.boolean(field).defaultTo(false);
        }

        // 2. Drop new fields
        table.dropColumns(...newFields);

        // 3. Re-add old fields
        const oldFields = [
            'medial_longitudinal_arch_left', 'lateral_longitudinal_arch_left', 'transverse_arch_left', 'calcaneus_left',
            'medial_longitudinal_arch_right', 'lateral_longitudinal_arch_right', 'transverse_arch_right', 'calcaneus_right'
        ];
        for (const field of oldFields) {
            table.boolean(field).defaultTo(false);
            table.decimal(`${field}_value`, 8, 2).nullable();
        }
    });
}
