import api from './axios';
import { Order } from '@/@types/order';

const getAdminOrders = async (filters?: { status?: string; search?: string }): Promise<Order[]> => {
  const { data } = await api.get('/orders/admin', { params: filters });
  return data;
};

const getIndustryOrders = async (filters?: { status?: string; search?: string }): Promise<Order[]> => {
  // Typically, this would point to a different endpoint if permissions differ,
  // but for filtering, we can reuse the admin endpoint.
  const { data } = await api.get('/orders/admin', { params: filters });
  return data;
};

const batchUpdateStatusByAdmin = async (orderIds: number[], status: string) => {
  const { data } = await api.post('/orders/admin/batch-status', { orderIds, status });
  return data;
};

const exportOrdersToCsv = async (): Promise<Blob> => {
  const { data } = await api.get('/orders/admin/export-csv', {
    responseType: 'blob',
  });
  return data;
};

export { getAdminOrders, getIndustryOrders, batchUpdateStatusByAdmin, exportOrdersToCsv };
