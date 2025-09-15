import { Model } from 'objection';

export class InsoleModel extends Model {
  id!: number;
  description!: string;
  active!: boolean;

  static get tableName() {
    return 'insole_models';
  }
}
