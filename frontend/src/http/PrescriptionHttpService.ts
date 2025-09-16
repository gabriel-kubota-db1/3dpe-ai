import { api } from './api';
// Define Prescription types later
// import { Prescription } from '@/@types/prescription';

export const getPrescriptions = async (): Promise<any[]> => {
  const { data } = await api.get('/prescriptions');
  return data;
};

export const createPrescription = async (prescriptionData: any): Promise<any> => {
  const { data } = await api.post('/prescriptions', prescriptionData);
  return data;
};
