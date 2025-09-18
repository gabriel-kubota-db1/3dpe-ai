import { Coupon } from '@/@types/coupon';
import api from './axios';

export const validateCoupon = async (code: string): Promise<Coupon> => {
  const { data } = await api.post('/coupons/validate', { code });
  return data;
};
