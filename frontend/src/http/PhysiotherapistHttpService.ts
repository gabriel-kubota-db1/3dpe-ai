import { ProductionReportRecord } from '@/@types/physiotherapist';
import api from './axios';

interface ProductionReportFilters {
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const getProductionReport = async (filters: ProductionReportFilters): Promise<ProductionReportRecord[]> => {
  const { data } = await api.get('/physiotherapists/production', { params: filters });
  return data;
};
