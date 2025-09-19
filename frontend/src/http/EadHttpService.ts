import api from './axios';
import { Course, Module, Lesson, CourseProgress } from '@/@types/ead';

// --- Admin ---
export const createCourse = (data: Omit<Course, 'id'>): Promise<Course> => api.post('/ead/courses', data).then(res => res.data);
export const updateCourse = (id: number, data: Partial<Course>): Promise<Course> => api.put(`/ead/courses/${id}`, data).then(res => res.data);
export const deleteCourse = (id: number): Promise<void> => api.delete(`/ead/courses/${id}`);

export const createModule = (courseId: number, data: Omit<Module, 'id' | 'ead_course_id' | 'lessons'>): Promise<Module> => api.post(`/ead/courses/${courseId}/modules`, data).then(res => res.data);
export const updateModule = (id: number, data: Partial<Module>): Promise<Module> => api.put(`/ead/modules/${id}`, data).then(res => res.data);
export const deleteModule = (id: number): Promise<void> => api.delete(`/ead/modules/${id}`);

export const createLesson = (moduleId: number, data: Omit<Lesson, 'id' | 'ead_module_id'>): Promise<Lesson> => api.post(`/ead/modules/${moduleId}/lessons`, data).then(res => res.data);
export const updateLesson = (id: number, data: Partial<Lesson>): Promise<Lesson> => api.put(`/ead/lessons/${id}`, data).then(res => res.data);
export const deleteLesson = (id: number): Promise<void> => api.delete(`/ead/lessons/${id}`);

// --- Shared ---
export const getAllCourses = (): Promise<Course[]> => api.get('/ead/courses').then(res => res.data);
export const getCourseDetails = (id: number): Promise<Course> => api.get(`/ead/courses/${id}`).then(res => res.data);

// --- Physiotherapist ---
export const getMyCoursesProgress = (): Promise<CourseProgress[]> => api.get('/ead/my-courses').then(res => res.data);
export const updateMyProgress = (courseId: number, lessonId: number): Promise<CourseProgress> => api.put(`/ead/my-courses/${courseId}/progress`, { lessonId }).then(res => res.data);
export const evaluateCourse = (courseId: number, evaluation: number, evaluation_comment: string): Promise<CourseProgress> => api.post(`/ead/my-courses/${courseId}/evaluate`, { evaluation, evaluation_comment }).then(res => res.data);
