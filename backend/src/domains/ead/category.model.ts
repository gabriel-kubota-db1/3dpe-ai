import { Model } from 'objection';
import { Course } from './course.model';
import path from 'path';

export class Category extends Model {
  static tableName = 'ead_categories';

  id!: number;
  name!: string;

  static jsonSchema = {
    type: 'object',
    required: ['name'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
    },
  };

  static relationMappings = () => ({
    courses: {
      relation: Model.HasManyRelation,
      modelClass: path.join(__dirname, 'course.model'),
      join: {
        from: 'ead_categories.id',
        to: 'ead_courses.category_id',
      },
    },
  });
}
