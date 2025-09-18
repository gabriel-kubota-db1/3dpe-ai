import { Model } from 'objection';

export class Palmilogram extends Model {
  id!: number;
  
  // Left Foot
  cic_left?: number;
  cavr_left?: number;
  cavr_total_left?: number;
  cavr_prolonged_left?: number;
  cavl_left?: number;
  cavl_total_left?: number;
  cavl_prolonged_left?: number;
  brc_left?: number;
  boton_left?: number;
  bic_left?: number;
  longitudinal_arch_left?: number;

  // Right Foot
  cic_right?: number;
  cavr_right?: number;
  cavr_total_right?: number;
  cavr_prolonged_right?: number;
  cavl_right?: number;
  cavl_total_right?: number;
  cavl_prolonged_right?: number;
  brc_right?: number;
  boton_right?: number;
  bic_right?: number;
  longitudinal_arch_right?: number;

  static get tableName() {
    return 'palmilograms';
  }

  // Convert string decimals to numbers after database fetch
  $afterGet(queryContext: any) {
    const numericFields = [
      'cic_left', 'cavr_left', 'cavr_total_left', 'cavr_prolonged_left', 'cavl_left', 'cavl_total_left', 'cavl_prolonged_left', 'brc_left', 'boton_left', 'bic_left', 'longitudinal_arch_left',
      'cic_right', 'cavr_right', 'cavr_total_right', 'cavr_prolonged_right', 'cavl_right', 'cavl_total_right', 'cavl_prolonged_right', 'brc_right', 'boton_right', 'bic_right', 'longitudinal_arch_right'
    ];

    numericFields.forEach(field => {
      if (this[field as keyof this] !== null && this[field as keyof this] !== undefined) {
        const value = this[field as keyof this];
        if (typeof value === 'string') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            (this as any)[field] = numValue;
          }
        }
      }
    });

    return this;
  }

  // Ensure numbers are properly formatted before database insert/update
  $beforeInsert(queryContext: any) {
    this.formatNumericFields();
    return super.$beforeInsert(queryContext);
  }

  $beforeUpdate(opt: any, queryContext: any) {
    this.formatNumericFields();
    return super.$beforeUpdate(opt, queryContext);
  }

  private formatNumericFields() {
    const numericFields = [
      'cic_left', 'cavr_left', 'cavr_total_left', 'cavr_prolonged_left', 'cavl_left', 'cavl_total_left', 'cavl_prolonged_left', 'brc_left', 'boton_left', 'bic_left', 'longitudinal_arch_left',
      'cic_right', 'cavr_right', 'cavr_total_right', 'cavr_prolonged_right', 'cavl_right', 'cavl_total_right', 'cavl_prolonged_right', 'brc_right', 'boton_right', 'bic_right', 'longitudinal_arch_right'
    ];

    numericFields.forEach(field => {
      if (this[field as keyof this] !== null && this[field as keyof this] !== undefined) {
        const value = this[field as keyof this];
        if (typeof value === 'string') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            (this as any)[field] = numValue;
          }
        }
      }
    });
  }
}
