import { Model } from 'objection';
import { User } from '../users/model';
import { InsolePrescription } from '../prescriptions/model';
import { Coupon } from '../coupons/model';

export class Order extends Model {
  id!: number;
  order_date!: string;
  status!: 'PENDING_PAYMENT' | 'PROCESSING' | 'IN_PRODUCTION' | 'SHIPPED' | 'COMPLETED' | 'CANCELED';
  physiotherapist_id!: number;
  observations?: string;
  payment_method?: string;
  order_value!: number;
  freight_value!: number;
  discount_value!: number;
  total_value!: number;
  gateway_id?: string;
  transaction_date?: string;
  coupon_id?: number;

  physiotherapist?: User;
  prescriptions?: InsolePrescription[];
  coupon?: Coupon;

  static get tableName() {
    return 'orders';
  }

  static get relationMappings() {
    return {
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
      coupon: {
        relation: Model.BelongsToOneRelation,
        modelClass: Coupon,
        join: {
          from: 'orders.coupon_id',
          to: 'coupons.id',
        },
      },
    };
  }
}
