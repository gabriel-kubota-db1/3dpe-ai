import { Model } from 'objection';
import { toMySQLDateTime } from '../../utils/datetime';

export class Lesson extends Model {
  static tableName = 'ead_lessons';

  id!: number;
  ead_module_id!: number;
  title!: string;
  url!: string;
  order!: number;
  created_at!: string;
  updated_at!: string;

  $beforeInsert() {
    const now = toMySQLDateTime();
    this.created_at = now;
    this.updated_at = now;
  }

  $beforeUpdate() {
    this.updated_at = toMySQLDateTime();
  }
}
