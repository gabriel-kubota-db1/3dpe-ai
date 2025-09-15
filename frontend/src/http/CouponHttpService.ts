import api from './axios';
import { Coupon } from '@/@types/coupon';

export const getCoupons = (): Promise<Coupon[]> => api.get('/coupons').then(res => res.data);
export const createCoupon = (data: Omit<Coupon, 'id'>): Promise<Coupon> => api.post('/coupons', data).then(res => res.data);
export const updateCoupon = (id: number, data: Partial<Coupon>): Promise<Coupon> => api.put(`/coupons/${id}`, data).then(res => res.data);
export const deleteCoupon = (id: number): Promise<void> => api.delete(`/coupons/${id}`);
