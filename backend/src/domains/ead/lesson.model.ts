import { Model } from 'objection';
import { Module } from './module.model';

export class Lesson extends Model {
  static tableName = 'ead_lessons';

  id!: number;
  name!: string;
  content!: string;
  video_url?: string;
  order!: number;
  duration?: number; // in seconds
  ead_module_id!: number;

  module?: Module;

  static jsonSchema = {
    type: 'object',
    required: ['name', 'content', 'order', 'ead_module_id'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 1, maxLength: 255 },
      content: { type: 'string' },
      video_url: { type: ['string', 'null'], format: 'uri' },
      order: { type: 'integer' },
      duration: { type: ['integer', 'null'] },
      ead_module_id: { type: 'integer' },
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
