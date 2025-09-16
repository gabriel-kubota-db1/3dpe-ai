export interface Patient {
  id: number;
  physiotherapist_id: number;
  name: string;
  email?: string;
  phone?: string;
  cpf?: string;
  rg?: string;
  date_of_birth?: string;
  responsible_name?: string;
  responsible_cpf?: string;
  created_at: string;
  updated_at: string;
}

export interface PatientAuditLog {
  id: number;
  patient_id: number;
  user_id: number;
  action: 'CREATED' | 'UPDATED';
  old_data?: Partial<Patient>;
  new_data: Partial<Patient>;
  changed_at: string;
}
