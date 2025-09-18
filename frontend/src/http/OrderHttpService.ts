import api from './axios';
import { Order } from '@/@types/order';

// Physiotherapist
export const getPhysioOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders/physiotherapist');
  return data;
};

export const getShippingOptions = async (payload: { cep: string; prescriptionIds: number[] }): Promise<any> => {
  const { data } = await api.post('/orders/physiotherapist/shipping', payload);
  return data;
};

export const createCheckout = async (payload: any): Promise<Order> => {
  const { data } = await api.post('/orders/physiotherapist/checkout', payload);
  return data;
};

// Industry
export const getIndustryOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders/industry');
  return data;
};

export const updateOrderStatusByIndustry = async (id: number, status: string): Promise<Order> => {
  const { data } = await api.put(`/orders/industry/${id}/status`, { status });
  return data;
};

// Admin
export const getAdminOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders/admin');
  return data;
};

export const batchUpdateStatusByAdmin = async (orderIds: number[], status: string): Promise<any> => {
  const { data } = await api.put('/orders/admin/status', { orderIds, status });
  return data;
};

export const exportOrdersToCsv = async (): Promise<Blob> => {
  const { data } = await api.get('/orders/admin/export/csv', { responseType: 'blob' });
  return data;
};
