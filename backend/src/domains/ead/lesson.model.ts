import { Model } from 'objection';

export class Lesson extends Model {
  static tableName = 'ead_lessons';

  id!: number;
  ead_module_id!: number;
  title!: string;
  url!: string;
  order!: number;
  created_at!: string;
  updated_at!: string;
}
