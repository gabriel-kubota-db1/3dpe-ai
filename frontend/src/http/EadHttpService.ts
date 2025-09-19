import { api } from './api';
import { Category, Course, Module, Lesson, CourseProgress } from '@/@types/ead';

// --- Category ---
export const getCategories = async (filters?: { name?: string }): Promise<Category[]> => {
  const { data } = await api.get('/ead/categories', { params: filters });
  return data;
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const { data } = await api.post('/ead/categories', category);
  return data;
};

export const updateCategory = async (id: number, category: Partial<Category>): Promise<Category> => {
  const { data } = await api.put(`/ead/categories/${id}`, category);
  return data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/ead/categories/${id}`);
};

// --- Course ---
export const getAllCourses = async (filters?: { search?: string; categoryId?: number }): Promise<Course[]> => {
  const { data } = await api.get('/ead/courses', { params: filters });
  return data;
};

export const getCourseDetails = async (id: number): Promise<Course> => {
  const { data } = await api.get(`/ead/courses/${id}`);
  return data;
};

export const createCourse = async (course: Omit<Course, 'id'>): Promise<Course> => {
  const { data } = await api.post('/ead/courses', course);
  return data;
};

export const updateCourse = async (id: number, course: Partial<Course>): Promise<Course> => {
  const { data } = await api.put(`/ead/courses/${id}`, course);
  return data;
};

export const deleteCourse = async (id: number): Promise<void> => {
  await api.delete(`/ead/courses/${id}`);
};

// --- Module ---
export const createModule = async (courseId: number, module: Omit<Module, 'id'>): Promise<Module> => {
  const { data } = await api.post(`/ead/courses/${courseId}/modules`, module);
  return data;
};

export const updateModule = async (id: number, module: Partial<Module>): Promise<Module> => {
  const { data } = await api.put(`/ead/modules/${id}`, module);
  return data;
};

export const deleteModule = async (id: number): Promise<void> => {
  await api.delete(`/ead/modules/${id}`);
};

export const reorderModules = async (courseId: number, orderedIds: number[]): Promise<void> => {
  await api.put(`/ead/courses/${courseId}/modules/reorder`, { orderedIds });
};

// --- Lesson ---
export const createLesson = async (moduleId: number, lesson: Omit<Lesson, 'id'>): Promise<Lesson> => {
  const { data } = await api.post(`/ead/modules/${moduleId}/lessons`, lesson);
  return data;
};

export const updateLesson = async (id: number, lesson: Partial<Lesson>): Promise<Lesson> => {
  const { data } = await api.put(`/ead/lessons/${id}`, lesson);
  return data;
};

export const deleteLesson = async (id: number): Promise<void> => {
  await api.delete(`/ead/lessons/${id}`);
};

export const reorderLessons = async (moduleId: number, orderedIds: number[]): Promise<void> => {
  await api.put(`/ead/modules/${moduleId}/lessons/reorder`, { orderedIds });
};

// --- Physiotherapist ---
export const getMyCoursesProgress = async (): Promise<CourseProgress[]> => {
  const { data } = await api.get('/ead/my-courses');
  return data;
};

export const updateMyProgress = async (courseId: number, lessonId: number): Promise<CourseProgress> => {
  const { data } = await api.post(`/ead/my-courses/${courseId}/progress`, { lessonId });
  return data;
};

export const evaluateCourse = async (courseId: number, evaluation: number, evaluation_comment: string): Promise<CourseProgress> => {
  const { data } = await api.post(`/ead/my-courses/${courseId}/evaluate`, { evaluation, evaluation_comment });
  return data;
};
