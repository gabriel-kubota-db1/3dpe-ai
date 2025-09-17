import { Model } from 'objection';

export class Coupon extends Model {
  id!: number;
  code!: string;
  value!: number;
  start_date!: string;
  finish_date!: string;
  active!: boolean;

  static get tableName() {
    return 'coupons';
  }
}
