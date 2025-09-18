import api from './axios';
import { Order } from '@/@types/order';

// --- Physiotherapist Functions ---
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

// --- Admin/Industry Functions ---
export const getAdminOrders = async (): Promise<Order[]> => {
  const { data } = await api.get('/orders/industry');
  return data;
};

export const updateOrderStatusByAdmin = async (id: number, status: string): Promise<Order> => {
  const { data } = await api.patch(`/orders/industry/${id}/status`, { status });
  return data;
};

export const batchUpdateStatusByAdmin = async (orderIds: number[], status: string): Promise<void> => {
  await api.post('/orders/industry/batch-status', { orderIds, status });
};

export const exportOrdersToCsv = async (): Promise<Blob> => {
  const response = await api.get('/orders/industry/export/csv', {
    responseType: 'blob',
  });
  return response.data;
};

// --- Industry Functions (aliases for admin functions since they use same endpoints) ---
export const getIndustryOrders = getAdminOrders;
export const updateOrderStatusByIndustry = updateOrderStatusByAdmin;
export const batchUpdateStatusByIndustry = batchUpdateStatusByAdmin;
