import { Model } from 'objection';

export class Coating extends Model {
  id!: number;
  description!: string;
  active!: boolean;

  static get tableName() {
    return 'coatings';
  }
}
