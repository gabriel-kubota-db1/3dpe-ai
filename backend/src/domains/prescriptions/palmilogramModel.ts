import { Model } from 'objection';

export class Palmilogram extends Model {
  id!: number;
  cic_left?: boolean;
  cic_left_value?: number;
  cavr_left?: boolean;
  cavr_left_value?: number;
  medial_longitudinal_arch_left?: boolean;
  medial_longitudinal_arch_left_value?: number;
  lateral_longitudinal_arch_left?: boolean;
  lateral_longitudinal_arch_left_value?: number;
  transverse_arch_left?: boolean;
  transverse_arch_left_value?: number;
  calcaneus_left?: boolean;
  calcaneus_left_value?: number;
  cic_right?: boolean;
  cic_right_value?: number;
  cavr_right?: boolean;
  cavr_right_value?: number;
  medial_longitudinal_arch_right?: boolean;
  medial_longitudinal_arch_right_value?: number;
  lateral_longitudinal_arch_right?: boolean;
  lateral_longitudinal_arch_right_value?: number;
  transverse_arch_right?: boolean;
  transverse_arch_right_value?: number;
  calcaneus_right?: boolean;
  calcaneus_right_value?: number;
  observations?: string;

  static get tableName() {
    return 'palmilograms';
  }
}
