import { Model } from 'objection';

export type CoatingType = 'EVA' | 'Fabric';
export type ProductType = 'INSOLE' | 'SLIPPER' | 'ELEMENT';

export class Coating extends Model {
  id!: number;
  description!: string;
  coating_type!: CoatingType;
  number_range!: string;
  cost_value!: number;
  sell_value!: number;
  weight!: number;
  type!: ProductType;
  active!: boolean;

  static get tableName() {
    return 'coatings';
  }
}
