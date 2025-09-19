import { Model } from 'objection';
import { Lesson } from './lesson.model';
import { toMySQLDateTime } from '../../utils/datetime';

export class Module extends Model {
  static tableName = 'ead_modules';

  id!: number;
  ead_course_id!: number;
  title!: string;
  order!: number;
  created_at!: string;
  updated_at!: string;

  lessons?: Lesson[];

  $beforeInsert() {
    const now = toMySQLDateTime();
    this.created_at = now;
    this.updated_at = now;
  }

  $beforeUpdate() {
    this.updated_at = toMySQLDateTime();
  }

  static relationMappings = {
    lessons: {
      relation: Model.HasManyRelation,
      modelClass: Lesson,
      join: {
        from: 'ead_modules.id',
        to: 'ead_lessons.ead_module_id',
      },
    },
  };
}
