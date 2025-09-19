import { api } from './api';
import { InsoleModel } from '@/@types/insoleModel';

export const getInsoleModels = async (filters?: { model_type?: string; active?: string; description?: string }): Promise<InsoleModel[]> => {
  const { data } = await api.get('/insole-models', { params: filters });
  return data;
};

export const createInsoleModel = async (model: Omit<InsoleModel, 'id'>): Promise<InsoleModel> => {
  const { data } = await api.post('/insole-models', model);
  return data;
};

export const updateInsoleModel = async (id: number, model: Partial<InsoleModel>): Promise<InsoleModel> => {
  const { data } = await api.put(`/insole-models/${id}`, model);
  return data;
};

export const deleteInsoleModel = async (id: number): Promise<void> => {
  await api.delete(`/insole-models/${id}`);
};
