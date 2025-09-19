import { Model } from 'objection';
import { Lesson } from './lesson.model';

export class Module extends Model {
  static tableName = 'ead_modules';

  id!: number;
  ead_course_id!: number;
  title!: string;
  order!: number;
  created_at!: string;
  updated_at!: string;

  lessons?: Lesson[];

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
