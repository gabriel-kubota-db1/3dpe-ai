import { Model } from 'objection';

export class InsoleModel extends Model {
  id!: number;
  description!: string;
  type!: string;
  numeration!: string;
  coating_type!: 'eva' | 'fabric';
  eva_coating_id?: number | null;
  fabric_coating_id?: number | null;
  cost_value!: number;
  sale_value!: number;
  active!: boolean;

  static get tableName() {
    return 'insole_models';
  }
}
