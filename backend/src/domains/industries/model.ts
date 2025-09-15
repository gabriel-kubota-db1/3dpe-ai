import { Model } from 'objection';

export class Industry extends Model {
  id!: number;
  user_id!: number;

  static get tableName() {
    return 'industries';
  }
}
