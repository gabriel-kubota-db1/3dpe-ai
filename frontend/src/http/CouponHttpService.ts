import { Coupon } from '@/@types/coupon';
import api from './axios';

export const getCoupons = async (filters?: { active?: string; code?: string }): Promise<Coupon[]> => {
  const { data } = await api.get('/coupons', { params: filters });
  return data;
};

export const createCoupon = async (data: Omit<Coupon, 'id'>): Promise<Coupon> => {
  const response = await api.post('/coupons', data);
  return response.data;
};

export const updateCoupon = async (id: number, data: Partial<Coupon>): Promise<Coupon> => {
  const response = await api.put(`/coupons/${id}`, data);
  return response.data;
};

export const deleteCoupon = async (id: number): Promise<void> => {
  await api.delete(`/coupons/${id}`);
};

export const validateCoupon = async (code: string): Promise<Coupon> => {
  const { data } = await api.post('/coupons/validate', { code });
  return data;
};
