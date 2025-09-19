import { Model } from 'objection';

export class Progress extends Model {
  static tableName = 'physiotherapist_course_progress';

  id!: number;
  physiotherapist_id!: number;
  ead_course_id!: number;
  completed_lessons!: number[]; // Stored as JSON in DB
  progress!: number;
  status!: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  evaluation?: number;
  evaluation_comment?: string;
  created_at!: string;
  updated_at!: string;

  $beforeInsert() {
    if (this.completed_lessons && typeof this.completed_lessons !== 'string') {
      // @ts-ignore
      this.completed_lessons = JSON.stringify(this.completed_lessons);
    }
  }

  $beforeUpdate() {
    if (this.completed_lessons && typeof this.completed_lessons !== 'string') {
      // @ts-ignore
      this.completed_lessons = JSON.stringify(this.completed_lessons);
    }
  }

  $parseDatabaseJson(json: any) {
    json = super.$parseDatabaseJson(json);
    if (json.completed_lessons && typeof json.completed_lessons === 'string') {
      json.completed_lessons = JSON.parse(json.completed_lessons);
    }
    return json;
  }
}
