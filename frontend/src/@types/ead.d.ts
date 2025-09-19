export interface Lesson {
  id: number;
  ead_module_id: number;
  title: string;
  url: string;
  order: number;
}

export interface Module {
  id: number;
  ead_course_id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  name: string;
  category: string;
  description?: string;
  cover_url?: string;
  modules?: Module[];
}

export interface CourseProgress {
  id: number;
  physiotherapist_id: number;
  ead_course_id: number;
  completed_lessons: number[];
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  evaluation?: number;
  evaluation_comment?: string;
}
