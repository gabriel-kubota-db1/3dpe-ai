import { DashboardMetrics } from '@/@types/dashboard';
import api from './axios';

export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  const { data } = await api.get('/dashboard/metrics');
  return data;
};
