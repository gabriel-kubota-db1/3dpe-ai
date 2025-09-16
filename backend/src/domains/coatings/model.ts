import { Model } from 'objection';

export type CoatingType = 'EVA' | 'Fabric';

export class Coating extends Model {
  id!: number;
  description!: string;
  coating_type!: CoatingType;
  active!: boolean;

  static get tableName() {
    return 'coatings';
  }
}
