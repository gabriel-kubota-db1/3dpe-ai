import { Model, RelationMappings, RelationMappingsThunk } from 'objection';
import { Patient } from '../patients/model';
import { InsoleModel } from '../insole-models/model';
import { Palmilogram } from './palmilogramModel';

export class InsolePrescription extends Model {
  id!: number;
  patient_id!: number;
  insole_model_id!: number;
  palmilhogram_id!: number;
  numeration!: string;
  status!: 'DRAFT' | 'ACTIVE' | 'CANCELED' | 'COMPLETED';
  observations?: string;
  created_at!: string;
  updated_at!: string;

  patient?: Patient;
  insoleModel?: InsoleModel;
  palmilogram?: Palmilogram;

  static get tableName() {
    return 'insole_prescriptions';
  }

  static relationMappings: RelationMappings | RelationMappingsThunk = {
    patient: {
      relation: Model.BelongsToOneRelation,
      modelClass: Patient,
      join: {
        from: 'insole_prescriptions.patient_id',
        to: 'patients.id',
      },
    },
    insoleModel: {
      relation: Model.BelongsToOneRelation,
      modelClass: InsoleModel,
      join: {
        from: 'insole_prescriptions.insole_model_id',
        to: 'insole_models.id',
      },
    },
    palmilogram: {
      relation: Model.BelongsToOneRelation,
      modelClass: Palmilogram,
      join: {
        from: 'insole_prescriptions.palmilhogram_id',
        to: 'palmilograms.id',
      },
    },
  };
}
