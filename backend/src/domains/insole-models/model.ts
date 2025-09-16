import { Model } from 'objection';
import path from 'path';
import { Coating } from '../coatings/model';

export class InsoleModel extends Model {
  id!: number;
  description!: string;
  coating_id?: number | null;
  active!: boolean;
  created_at!: string;
  updated_at!: string;

  // Optional: not a database column, but will be populated by the relation
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
      modelClass: path.join(__dirname, '../coatings/model'),
      join: {
        from: 'insole_models.coating_id',
        to: 'coatings.id',
      },
    },
  };
}
