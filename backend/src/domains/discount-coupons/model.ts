import { Model } from 'objection';

export class DiscountCoupon extends Model {
  id!: number;
  code!: string;
  percentage!: number;
  active!: boolean;
  start_date!: string;
  end_date!: string;

  static get tableName() {
    return 'discount_coupons';
  }
}
