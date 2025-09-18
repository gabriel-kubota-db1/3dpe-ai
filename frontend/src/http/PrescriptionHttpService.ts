import api from './axios';
import { Prescription } from '@/@types/prescription';

export const getPrescriptions = async (): Promise<Prescription[]> => {
  const { data } = await api.get('/prescriptions');
  return data;
};

export const getPrescription = async (id: number): Promise<Prescription> => {
  const { data } = await api.get(`/prescriptions/${id}`);
  return data;
};

export const getAdminPrescriptions = async (filters?: { status?: string; patientName?: string }): Promise<Prescription[]> => {
  const { data } = await api.get('/prescriptions/all', { params: filters });
  return data;
};
