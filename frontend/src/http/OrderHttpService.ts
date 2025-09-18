import api from './axios';
import { Order } from '@/@types/order';

// Physiotherapist
export const getPhysioOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders/physiotherapist');
  return data;
};

export const getPhysioOrder = async (id: number): Promise<Order> => {
  const { data } = await api.get(`/orders/physiotherapist/${id}`);
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

export const confirmPayment = async (id: number): Promise<Order> => {
  const { data } = await api.post(`/orders/physiotherapist/${id}/pay`);
  return data;
};

export const updatePhysioOrderStatus = async (payload: { id: number; status: string }): Promise<Order> => {
  const { id, status } = payload;
  const { data } = await api.patch(`/orders/physiotherapist/${id}/status`, { status });
  return data;
};

// Admin/Industry
export const getAdminOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders/industry');
  return data;
};

export const getAdminOrderDetails = async (id: number): Promise<Order> => {
  const { data } = await api.get(`/orders/industry/${id}`);
  return data;
};

export const updateOrderStatusByAdmin = async ({ id, status }: { id: number, status: string }): Promise<Order> => {
  const { data } = await api.patch(`/orders/industry/${id}/status`, { status });
  return data;
};

export const batchUpdateStatusByAdmin = async (orderIds: number[], status: string): Promise<{ message: string }> => {
  const { data } = await api.post('/orders/industry/batch-status', { orderIds, status });
  return data;
};

export const getIndustryOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders/industry');
  return data;
};

export const getIndustryOrderDetails = async (id: number): Promise<Order> => {
  const { data } = await api.get(`/orders/industry/${id}`);
  return data;
};

export const exportOrdersToCsv = async (): Promise<Blob> => {
  const { data } = await api.get('/orders/industry/export/csv', { responseType: 'blob' });
  return data;
};
