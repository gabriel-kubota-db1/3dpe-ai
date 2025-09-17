import api from './axios';
import { Patient, PatientAuditLog } from '@/@types/patient';

interface GetPatientsParams {
  search?: string;
  active?: string; // 'true', 'false', or undefined for 'all'
}

export const getPatients = async (params: GetPatientsParams = {}): Promise<Patient[]> => {
  const { data } = await api.get('/patients', { params });
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
