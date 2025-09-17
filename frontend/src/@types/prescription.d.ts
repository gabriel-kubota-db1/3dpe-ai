import { Patient } from "./patient";
import { InsoleModel } from "./insoleModel";

export interface Palmilhogram {
  id?: number;
  
  // Left Foot
  cic_left?: number;
  cavr_left?: number;
  cavr_total_left?: number;
  cavr_prolonged_left?: number;
  cavl_left?: number;
  cavl_total_left?: number;
  cavl_prolonged_left?: number;
  brc_left?: number;
  boton_left?: number;
  bic_left?: number;
  longitudinal_arch_left?: number;

  // Right Foot
  cic_right?: number;
  cavr_right?: number;
  cavr_total_right?: number;
  cavr_prolonged_right?: number;
  cavl_right?: number;
  cavl_total_right?: number;
  cavl_prolonged_right?: number;
  brc_right?: number;
  boton_right?: number;
  bic_right?: number;
  longitudinal_arch_right?: number;
}

export interface Prescription {
  id: number;
  patient_id: number;
  insole_model_id: number;
  palmilhogram_id: number;
  numeration: string;
  status: 'DRAFT' | 'ACTIVE' | 'CANCELED' | 'COMPLETED';
  observations?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  insoleModel?: InsoleModel;
  palmilogram?: Palmilhogram;
}
