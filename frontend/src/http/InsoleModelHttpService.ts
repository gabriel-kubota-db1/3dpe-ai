import api from './axios';
import { InsoleModel } from '@/@types/insoleModel';

export const getInsoleModels = async (): Promise<InsoleModel[]> => {
  const { data } = await api.get('/insole-models');
  return data;
};

export const createInsoleModel = async (insoleModelData: Omit<InsoleModel, 'id' | 'created_at' | 'updated_at'>): Promise<InsoleModel> => {
  const { data } = await api.post('/insole-models', insoleModelData);
  return data;
};

export const updateInsoleModel = async (id: number, insoleModelData: Partial<InsoleModel>): Promise<InsoleModel> => {
  const { data } = await api.put(`/insole-models/${id}`, insoleModelData);
  return data;
};

export const deleteInsoleModel = async (id: number): Promise<void> => {
  await api.delete(`/insole-models/${id}`);
};
