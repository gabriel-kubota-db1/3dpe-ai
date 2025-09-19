import { Model } from 'objection';
import path from 'path';
import { Course } from './course.model';
import { toMySQLDateTime } from '../../utils/datetime';

export class Category extends Model {
  static tableName = 'ead_categories';

  id!: number;
  name!: string;
  created_at?: string;
  updated_at?: string;

  static jsonSchema = {
    type: 'object',
    required: ['name'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
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
    courses: {
      relation: Model.HasManyRelation,
      modelClass: Course,
      join: {
        from: 'ead_categories.id',
        to: 'ead_courses.category_id',
      },
    },
  });
}
