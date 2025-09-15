import { Model } from 'objection';

export class Physiotherapist extends Model {
  id!: number;
  user_id!: number;
  council_acronym!: string;
  council_number!: string;
  council_uf!: string;
  loyalty_discount!: number;

  static get tableName() {
    return 'physiotherapists';
  }
}
