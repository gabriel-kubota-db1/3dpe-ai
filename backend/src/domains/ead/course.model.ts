import { Model } from 'objection';
import { Module } from './module.model';

export class Course extends Model {
  static tableName = 'ead_courses';

  id!: number;
  name!: string;
  category!: string;
  description?: string;
  cover_url?: string;
  created_at!: string;
  updated_at!: string;

  modules?: Module[];

  static relationMappings = {
    modules: {
      relation: Model.HasManyRelation,
      modelClass: Module,
      join: {
        from: 'ead_courses.id',
        to: 'ead_modules.ead_course_id',
      },
    },
  };
}
