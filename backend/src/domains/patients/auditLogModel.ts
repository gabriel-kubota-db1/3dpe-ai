import { Model } from 'objection';

export class PatientAuditLog extends Model {
  id!: number;
  patient_id!: number;
  user_id!: number;
  action!: 'CREATED' | 'UPDATED';
  old_data?: object;
  new_data!: object;
  changed_at!: string;

  static get tableName() {
    return 'patient_audit_logs';
  }
}
