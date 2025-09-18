import { Model, RelationMappings, RelationMappingsThunk } from 'objection';
import { User } from '../users/model';
import { InsolePrescription } from '../prescriptions/model';

export class Order extends Model {
  id!: number;
  order_date!: string;
  status!: 'PENDING_PAYMENT' | 'PROCESSING' | 'IN_PRODUCTION' | 'SHIPPED' | 'COMPLETED' | 'CANCELED';
  physiotherapist_id!: number;
  observations?: string;
  payment_method?: string;
  order_value!: number;
  freight_value!: number;
  total_value!: number;
  gateway_id?: string;
  transaction_date?: string;
  created_at!: string;
  updated_at!: string;

  physiotherapist?: User;
  prescriptions?: InsolePrescription[];

  static get tableName() {
    return 'orders';
  }

  static relationMappings: RelationMappings | RelationMappingsThunk = {
    physiotherapist: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'orders.physiotherapist_id',
        to: 'users.id',
      },
    },
    prescriptions: {
      relation: Model.ManyToManyRelation,
      modelClass: InsolePrescription,
      join: {
        from: 'orders.id',
        through: {
          from: 'order_prescriptions.order_id',
          to: 'order_prescriptions.insole_prescription_id',
        },
        to: 'insole_prescriptions.id',
      },
    },
  };
}
