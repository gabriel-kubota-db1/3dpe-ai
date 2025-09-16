import { Model } from 'objection';

export class InsoleModel extends Model {
  id!: number;
  description!: string;
  coating_id?: number | null;
  active!: boolean;
  created_at!: string;
  updated_at!: string;

  static get tableName() {
    return 'insole_models';
  }

  // This is important for Objection to automatically handle timestamps
  static get timestamps() {
    return true;
  }
}
