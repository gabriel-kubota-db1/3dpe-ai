import api from './axios';
import { Coating, CoatingType } from '@/@types/coating';

export const getCoatings = async (coatingType?: CoatingType): Promise<Coating[]> => {
  const params = coatingType ? { coating_type: coatingType } : {};
  const response = await api.get('/coatings', { params });
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
