import { api } from './api';
import { Patient, PatientAuditLog } from '@/@types/patient';

export const getPatients = async (): Promise<Patient[]> => {
  const { data } = await api.get('/patients');
  return data;
};

export const getPatient = async (id: number): Promise<Patient> => {
  const { data } = await api.get(`/patients/${id}`);
  return data;
};

export const createPatient = async (patientData: Partial<Patient>): Promise<Patient> => {
  const { data } = await api.post('/patients', patientData);
  return data;
};

export const updatePatient = async (id: number, patientData: Partial<Patient>): Promise<Patient> => {
  const { data } = await api.put(`/patients/${id}`, patientData);
  return data;
};

export const getPatientAuditLogs = async (patientId: number): Promise<PatientAuditLog[]> => {
    const { data } = await api.get(`/patients/${patientId}/audit-logs`);
    return data;
};
