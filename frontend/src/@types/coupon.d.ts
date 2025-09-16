export interface Coupon {
  id: number;
  code: string;
  value: number;
  start_date: string;
  finish_date: string;
  active: boolean;
}
