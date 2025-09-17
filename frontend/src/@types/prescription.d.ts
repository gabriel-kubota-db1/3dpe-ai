import { User } from './user';
import { InsoleModel } from './insole-model';

export interface PalmilhogramaData {
  cic_left?: number;
  cic_right?: number;
  cavr_left?: number;
  cavr_right?: number;
  cavr_total_left?: number;
  cavr_total_right?: number;
  cavr_prolonged_left?: number;
  cavr_prolonged_right?: number;
  cavl_total_left?: number;
  cavl_total_right?: number;
  cavl_left?: number;
  cavl_right?: number;
  cavl_prolonged_left?: number;
  cavl_prolonged_right?: number;
  brc_left?: number;
  brc_right?: number;
  boton_left?: number;
  boton_right?: number;
  bic_left?: number;
  bic_right?: number;
  longitudinal_arch_left?: number;
  longitudinal_arch_right?: number;
}


export interface Prescription extends PalmilhogramaData {
  id: number;
  patient_id: number;
  physiotherapist_id: number;
  insole_model_id: number;
  shoe_size: string;
  status: 'draft' | 'active' | 'canceled' | 'completed';
  observation?: string;
  created_at: string;
  updated_at: string;

  // Relations
  patient?: Partial<User>;
  physiotherapist?: Partial<User>;
  insoleModel?: Partial<InsoleModel>;
}
