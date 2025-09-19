export interface Category {
  id: number;
  name: string;
}

export interface Lesson {
  id: number;
  name: string;
  content: string;
  video_url?: string;
  order: number;
  duration?: number; // in seconds
  ead_module_id: number;
}

export interface Module {
  id: number;
  name: string;
  order: number;
  ead_course_id: number;
  lessons?: Lesson[];
}

export interface Course {
  id: number;
  name: string;
  description?: string;
  cover_url?: string;
  category_id?: number;
  status: boolean;
  category?: Category;
  modules?: Module[];
}
