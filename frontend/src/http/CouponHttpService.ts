import { api } from './api';
import { Coupon } from '@/@types/coupon';

export const getCoupons = async (filters?: { active?: string; code?: string }): Promise<Coupon[]> => {
  const { data } = await api.get('/coupons', { params: filters });
  return data;
};

export const createCoupon = async (coupon: Omit<Coupon, 'id'>): Promise<Coupon> => {
  const { data } = await api.post('/coupons', coupon);
  return data;
};

export const updateCoupon = async (id: number, coupon: Partial<Coupon>): Promise<Coupon> => {
  const { data } = await api.put(`/coupons/${id}`, coupon);
  return data;
};

export const deleteCoupon = async (id: number): Promise<void> => {
  await api.delete(`/coupons/${id}`);
};
