import { Patient } from "./patient";
import { InsoleModel } from "./insoleModel";

export interface Palmilhogram {
  id?: number;
  
  // Left Foot
  cic_left?: number | null;
  cavr_left?: number | null;
  cavr_total_left?: number | null;
  cavr_prolonged_left?: number | null;
  cavl_left?: number | null;
  cavl_total_left?: number | null;
  cavl_prolonged_left?: number | null;
  brc_left?: number | null;
  boton_left?: number | null;
  bic_left?: number | null;
  longitudinal_arch_left?: number | null;

  // Right Foot
  cic_right?: number | null;
  cavr_right?: number | null;
  cavr_total_right?: number | null;
  cavr_prolonged_right?: number | null;
  cavl_right?: number | null;
  cavl_total_right?: number | null;
  cavl_prolonged_right?: number | null;
  brc_right?: number | null;
  boton_right?: number | null;
  bic_right?: number | null;
  longitudinal_arch_right?: number | null;
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
