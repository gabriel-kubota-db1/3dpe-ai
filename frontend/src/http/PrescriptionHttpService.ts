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

export const createPrescription = async (data: any): Promise<Prescription> => {
    console.log('PrescriptionHttpService.createPrescription called with:', data);
    console.log('Palmilhogram data in service:', data.palmilhogram);
    console.log('Stringified data in service:', JSON.stringify(data, null, 2));
    
    const { data: response } = await api.post('/prescriptions', data);
    return response;
};

export const updatePrescription = async (id: number, prescriptionData: any): Promise<Prescription> => {
    console.log('PrescriptionHttpService.updatePrescription called with ID:', id);
    console.log('PrescriptionHttpService.updatePrescription called with data:', prescriptionData);
    console.log('Palmilhogram data in update service:', prescriptionData.palmilhogram);
    console.log('Stringified update data in service:', JSON.stringify(prescriptionData, null, 2));
    
    const { data } = await api.put(`/prescriptions/${id}`, prescriptionData);
    return data;
};
