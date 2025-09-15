import { Model } from 'objection';

export class Coupon extends Model {
  id!: number;
  code!: string;
  discount_type!: 'percentage' | 'fixed';
  value!: number;
  expiry_date!: string;
  active!: boolean;

  static get tableName() {
    return 'coupons';
  }
}
