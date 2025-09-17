import api from './api';
import { User } from '@/@types/user';

export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await api.get('/users');
  return data;
};

export const getUser = async (id: number): Promise<User> => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const { data } = await api.put(`/users/${id}`, userData);
  return data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const registerPhysiotherapist = async (userData: any): Promise<User> => {
  const { data } = await api.post('/users/register/physiotherapist', userData);
  return data;
};

export const registerIndustry = async (userData: any): Promise<User> => {
  const { data } = await api.post('/users/register/industry', userData);
  return data;
};

export const registerPatient = async (userData: any): Promise<User> => {
  const { data } = await api.post('/users/register/patient', userData);
  return data;
};

export const getUsersByRole = async (role: string): Promise<{ id: number; name: string }[]> => {
  const { data } = await api.get(`/users/role/${role}`);
  return data;
};
