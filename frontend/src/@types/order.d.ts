import { User } from './user';
import { Prescription } from './prescription';

export interface Order {
  id: number;
  order_date: string;
  status: 'PENDING_PAYMENT' | 'PROCESSING' | 'IN_PRODUCTION' | 'SHIPPED' | 'COMPLETED' | 'CANCELED';
  physiotherapist_id: number;
  observations?: string;
  payment_method?: string;
  order_value: number;
  freight_value: number;
  discount_value: number;
  total_value: number;
  gateway_id?: string;
  transaction_date?: string;
  coupon_id?: number;
  created_at: string;
  updated_at: string;
  physiotherapist?: Partial<User>;
  prescriptions?: Prescription[];
}
