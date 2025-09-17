export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  expiry_date: string;
  active: boolean;
}
