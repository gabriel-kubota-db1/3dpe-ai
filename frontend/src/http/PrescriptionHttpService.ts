import api from './api';
import { Prescription } from '@/@types/prescription';

export const getAllPrescriptions = async (): Promise<Prescription[]> => {
  const { data } = await api.get('/prescriptions');
  return data;
};

export const getPrescription = async (id: number): Promise<Prescription> => {
  const { data } = await api.get(`/prescriptions/${id}`);
  return data;
};

export const createPrescription = async (prescriptionData: Partial<Prescription>): Promise<Prescription> => {
  const { data } = await api.post('/prescriptions', prescriptionData);
  return data;
};

export const updatePrescription = async (id: number, prescriptionData: Partial<Prescription>): Promise<Prescription> => {
  const { data } = await api.put(`/prescriptions/${id}`, prescriptionData);
  return data;
};

export const deletePrescription = async (id: number): Promise<void> => {
  await api.delete(`/prescriptions/${id}`);
};
