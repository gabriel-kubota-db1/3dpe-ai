import { Model } from 'objection';
import { Module } from './module.model';
import { Category } from './category.model';
import { toMySQLDateTime } from '../../utils/datetime';
import path from 'path';

export class Course extends Model {
  static tableName = 'ead_courses';

  id!: number;
  name!: string;
  description?: string;
  cover_url?: string;
  category_id?: number;
  status!: boolean;
  created_at?: string;
  updated_at?: string;

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
      status: { type: 'boolean', default: true },
      created_at: { type: 'string' },
      updated_at: { type: 'string' },
    },
  };

  $beforeInsert() {
    const now = toMySQLDateTime();
    this.created_at = now;
    this.updated_at = now;
  }

  $beforeUpdate() {
    this.updated_at = toMySQLDateTime();
  }

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
