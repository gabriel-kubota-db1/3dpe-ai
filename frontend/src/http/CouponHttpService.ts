import { Coupon } from '@/@types/coupon';
import api from './axios';

export const validateCoupon = async (code: string): Promise<Coupon> => {
  const { data } = await api.post('/coupons/validate', { code });
  return data;
};

export const getCoupons = (): Promise<Coupon[]> => api.get('/coupons').then(res => res.data);
export const createCoupon = (data: Omit<Coupon, 'id'>): Promise<Coupon> => api.post('/coupons', data).then(res => res.data);
export const updateCoupon = (id: number, data: Partial<Coupon>): Promise<Coupon> => api.put(`/coupons/${id}`, data).then(res => res.data);
export const deleteCoupon = (id: number): Promise<void> => api.delete(`/coupons/${id}`);