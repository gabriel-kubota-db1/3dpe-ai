import { api } from './api';
import { Order } from '@/@types/order';

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
