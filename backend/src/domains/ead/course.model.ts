import { Model } from 'objection';
import { Module } from './module.model';
import { Category } from './category.model';
import path from 'path';

export class Course extends Model {
  static tableName = 'ead_courses';

  id!: number;
  name!: string;
  description?: string;
  cover_url?: string;
  category_id?: number;

  modules?: Module[];
  category?: Category;

  static jsonSchema = {
    type: 'object',
    required: ['name'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      description: { type: 'string' },
      cover_url: { type: 'string', format: 'uri' },
      category_id: { type: ['integer', 'null'] },
    },
  };

  static relationMappings = () => ({
    modules: {
      relation: Model.HasManyRelation,
      modelClass: Module,
      join: {
        from: 'ead_courses.id',
        to: 'ead_modules.ead_course_id',
      },
    },
    category: {
      relation: Model.BelongsToOneRelation,
      modelClass: Category,
      join: {
        from: 'ead_courses.category_id',
        to: 'ead_categories.id',
      },
    },
  });
}
