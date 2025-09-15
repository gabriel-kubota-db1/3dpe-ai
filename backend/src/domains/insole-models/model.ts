import { Model } from 'objection';

export class InsoleModel extends Model {
  id!: number;
  description!: string;
  type!: string;
  numeration!: string;
  coating_type!: 'eva' | 'fabric';
  eva_coating_id?: number;
  fabric_coating_id?: number;
  cost_value!: number;
  sale_value!: number;

  static get tableName() {
    return 'insole_models';
  }
}
