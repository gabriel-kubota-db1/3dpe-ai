import { Model } from 'objection';
import { Module } from './module.model';
import { toMySQLDateTime } from '../../utils/datetime';

export class Lesson extends Model {
  static tableName = 'ead_lessons';

  id!: number;
  title!: string;  // Matches database column
  url!: string;    // Matches database column  
  order!: number;
  duration?: number; // in seconds
  ead_module_id!: number;
  created_at?: string;
  updated_at?: string;

  module?: Module;

  $beforeInsert() {
    const now = toMySQLDateTime();
    this.created_at = now;
    this.updated_at = now;
  }

  $beforeUpdate() {
    this.updated_at = toMySQLDateTime();
  }

  static jsonSchema = {
    type: 'object',
    required: ['title', 'url', 'order', 'ead_module_id'],

    properties: {
      id: { type: 'integer' },
      title: { type: 'string', minLength: 1, maxLength: 255 },
      url: { type: 'string', format: 'uri' },
      order: { type: 'integer' },
      duration: { type: ['integer', 'null'] },
      ead_module_id: { type: 'integer' },
      created_at: { type: 'string' },
      updated_at: { type: 'string' },
    },
  };

  static relationMappings = () => ({
    module: {
      relation: Model.BelongsToOneRelation,
      modelClass: Module,
      join: {
        from: 'ead_lessons.ead_module_id',
        to: 'ead_modules.id',
      },
    },
  });
}
