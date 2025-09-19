import { Router } from 'express';
import * as controller from './controller';
import { isAuthenticated } from '../../middlewares/isAuthenticated';
import { checkRole } from '../../middlewares/checkRole';

const router = Router();
const isAdmin = checkRole(['admin']);
const isPhysio = checkRole(['physiotherapist']);

// --- Admin (Category Management) ---
router.get('/categories', isAuthenticated, isAdmin, controller.getAllCategories);
router.post('/categories', isAuthenticated, isAdmin, controller.createCategory);
router.put('/categories/:id', isAuthenticated, isAdmin, controller.updateCategory);
router.delete('/categories/:id', isAuthenticated, isAdmin, controller.deleteCategory);

// --- Admin (Content Management) ---
router.post('/courses', isAuthenticated, isAdmin, controller.createCourse);
router.put('/courses/:id', isAuthenticated, isAdmin, controller.updateCourse);
router.delete('/courses/:id', isAuthenticated, isAdmin, controller.deleteCourse);

router.post('/courses/:courseId/modules', isAuthenticated, isAdmin, controller.createModule);
router.put('/modules/:id', isAuthenticated, isAdmin, controller.updateModule);
router.delete('/modules/:id', isAuthenticated, isAdmin, controller.deleteModule);

router.post('/modules/:moduleId/lessons', isAuthenticated, isAdmin, controller.createLesson);
router.put('/lessons/:id', isAuthenticated, isAdmin, controller.updateLesson);
router.delete('/lessons/:id', isAuthenticated, isAdmin, controller.deleteLesson);

// --- Shared (Admin/Physiotherapist) ---
router.get('/courses', isAuthenticated, controller.getAllCourses);
router.get('/courses/:id', isAuthenticated, controller.getCourseDetails);

// --- Physiotherapist (Student) ---
router.get('/my-courses', isAuthenticated, isPhysio, controller.getMyCourses);
router.put('/my-courses/:courseId/progress', isAuthenticated, isPhysio, controller.updateProgress);
router.post('/my-courses/:courseId/evaluate', isAuthenticated, isPhysio, controller.evaluateCourse);

export default router;
