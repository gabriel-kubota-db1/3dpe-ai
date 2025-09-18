import api from './axios';
import { InsoleModel } from '@/@types/insoleModel';

export const getInsoleModels = (): Promise<InsoleModel[]> => api.get('/insole-models').then(res => res.data);
export const createInsoleModel = (data: Omit<InsoleModel, 'id'>): Promise<InsoleModel> => api.post('/insole-models', data).then(res => res.data);
export const updateInsoleModel = (id: number, data: Partial<InsoleModel>): Promise<InsoleModel> => api.put(`/insole-models/${id}`, data).then(res => res.data);
export const deleteInsoleModel = (id: number): Promise<void> => api.delete(`/insole-models/${id}`);
