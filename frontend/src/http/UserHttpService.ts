import api from './axios';
import { User, UserListItem } from '@/@types/user';

// Admin User Management
export const getUsers = (): Promise<UserListItem[]> => api.get('/users').then(res => res.data);
export const getUser = (id: number): Promise<User> => api.get(`/users/${id}`).then(res => res.data);
export const updateUser = (id: number, data: Partial<User>): Promise<User> => api.put(`/users/${id}`, data).then(res => res.data);
export const deleteUser = (id: number): Promise<void> => api.delete(`/users/${id}`);

// Admin User Registration
export const registerPhysiotherapist = (data: any): Promise<User> => api.post('/users/register/physiotherapist', data).then(res => res.data);
export const registerIndustry = (data: any): Promise<User> => api.post('/users/register/industry', data).then(res => res.data);
