import api from './axios';
import { Coating } from '@/@types/coating';

export const getCoatings = async (filters?: { coating_type?: string; active?: string; description?: string }): Promise<Coating[]> => {
  const response = await api.get('/coatings', { params: filters });
  return response.data;
};

export const createCoating = async (coating: Omit<Coating, 'id'>): Promise<Coating> => {
  const response = await api.post('/coatings', coating);
  return response.data;
};

export const updateCoating = async (id: number, coating: Partial<Coating>): Promise<Coating> => {
  const response = await api.put(`/coatings/${id}`, coating);
  return response.data;
};

export const deleteCoating = async (id: number): Promise<void> => {
  await api.delete(`/coatings/${id}`);
};
