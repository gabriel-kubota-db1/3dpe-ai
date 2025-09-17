import { Model, RelationMappings, RelationMappingsThunk } from 'objection';
import { User } from '../users/model';

export class PatientAuditLog extends Model {
  id!: number;
  patient_id!: number;
  user_id!: number;
  action!: 'CREATED' | 'UPDATED';
  old_data?: object;
  new_data!: object;
  changed_at!: string;

  user?: User;

  static get tableName() {
    return 'patient_audit_logs';
  }

  static relationMappings: RelationMappings | RelationMappingsThunk = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'patient_audit_logs.user_id',
        to: 'users.id',
      },
    },
  };
}
