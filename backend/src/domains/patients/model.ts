import { Model, RelationMappings, RelationMappingsThunk } from 'objection';
import { User } from '../users/model';
import { PatientAuditLog } from './auditLogModel';

export class Patient extends Model {
  id!: number;
  physiotherapist_id!: number;
  name!: string;
  email?: string;
  phone?: string;
  cpf?: string;
  rg?: string;
  date_of_birth?: string; // Stored as YYYY-MM-DD
  nationality?: string;
  naturality?: string;
  cep?: string;
  state?: string;
  city?: string;
  street?: string;
  number?: string;
  complement?: string;
  responsible_name?: string;
  responsible_cpf?: string;
  responsible_phone?: string;
  medic_history?: string;
  observations?: string;
  created_at!: string;
  updated_at!: string;

  physiotherapist?: User;
  auditLogs?: PatientAuditLog[];

  static get tableName() {
    return 'patients';
  }

  static relationMappings: RelationMappings | RelationMappingsThunk = {
    physiotherapist: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'patients.physiotherapist_id',
        to: 'users.id',
      },
    },
    auditLogs: {
      relation: Model.HasManyRelation,
      modelClass: PatientAuditLog,
      join: {
        from: 'patients.id',
        to: 'patient_audit_logs.patient_id',
      },
    },
  };
}
