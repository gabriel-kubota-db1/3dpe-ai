import { Model } from 'objection';
import { Coating } from '../coatings/model';

export type ProductType = 'INSOLE' | 'SLIPPER' | 'ELEMENT';

export class InsoleModel extends Model {
  id!: number;
  description!: string;
  coating_id?: number | null;
  number_range!: string;
  cost_value!: number;
  sell_value!: number;
  weight!: number;
  type!: ProductType;
  active!: boolean;
  created_at!: string;
  updated_at!: string;

  coating?: Coating;

  static get tableName() {
    return 'insole_models';
  }

  static get timestamps() {
    return true;
  }

  static relationMappings = {
    coating: {
      relation: Model.BelongsToOneRelation,
      modelClass: Coating,
      join: {
        from: 'insole_models.coating_id',
        to: 'coatings.id',
      },
    },
  };
}
