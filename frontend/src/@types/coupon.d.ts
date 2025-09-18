export interface Coupon {
  id: number;
  code: string;
  value: number; // percentage
  start_date: string;
  finish_date: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
