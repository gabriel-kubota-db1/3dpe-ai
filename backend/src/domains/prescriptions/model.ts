import { Model } from 'objection';
import User from '../users/model';
import InsoleModel from '../insole-models/model';

class Prescription extends Model {
  static get tableName() {
    return 'prescriptions';
  }

  id!: number;
  patient_id!: number;
  physiotherapist_id!: number;
  insole_model_id!: number;
  shoe_size!: string;
  status!: 'draft' | 'active' | 'canceled' | 'completed';
  observation?: string;

  // Palmilhograma fields
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

  static get relationMappings() {
    return {
      patient: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'prescriptions.patient_id',
          to: 'users.id',
        },
      },
      physiotherapist: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'prescriptions.physiotherapist_id',
          to: 'users.id',
        },
      },
      insoleModel: {
        relation: Model.BelongsToOneRelation,
        modelClass: InsoleModel,
        join: {
          from: 'prescriptions.insole_model_id',
          to: 'insole_models.id',
        },
      },
    };
  }
}

export default Prescription;
