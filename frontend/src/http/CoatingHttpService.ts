import api from './axios';
import { Coating } from '@/@types/coating';

export const getCoatings = (): Promise<Coating[]> => api.get('/coatings').then(res => res.data);
export const createCoating = (data: Omit<Coating, 'id'>): Promise<Coating> => api.post('/coatings', data).then(res => res.data);
export const updateCoating = (id: number, data: Partial<Coating>): Promise<Coating> => api.put(`/coatings/${id}`, data).then(res => res.data);
export const deleteCoating = (id: number): Promise<void> => api.delete(`/coatings/${id}`);
