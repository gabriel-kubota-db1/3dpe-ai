import { Request, Response } from 'express';
import { transaction } from 'objection';
import { Course } from './course.model';
import { Module } from './module.model';
import { Lesson } from './lesson.model';
import { Progress } from './progress.model';

// --- Admin Controllers ---

export const createCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.query().insert(req.body);
    res.status(201).json(course);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.query().patchAndFetchById(req.params.id, req.body);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const numDeleted = await Course.query().deleteById(req.params.id);
    if (numDeleted === 0) return res.status(404).json({ message: 'Course not found' });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
};

export const createModule = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const moduleData = { ...req.body, ead_course_id: parseInt(courseId, 10) };
    const newModule = await Module.query().insert(moduleData);
    res.status(201).json(newModule);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating module', error: error.message });
  }
};

export const updateModule = async (req: Request, res: Response) => {
  try {
    const updatedModule = await Module.query().patchAndFetchById(req.params.id, req.body);
    if (!updatedModule) return res.status(404).json({ message: 'Module not found' });
    res.json(updatedModule);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating module', error: error.message });
  }
};

export const deleteModule = async (req: Request, res: Response) => {
  try {
    const numDeleted = await Module.query().deleteById(req.params.id);
    if (numDeleted === 0) return res.status(404).json({ message: 'Module not found' });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting module', error: error.message });
  }
};

export const createLesson = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    const lessonData = { ...req.body, ead_module_id: parseInt(moduleId, 10) };
    const newLesson = await Lesson.query().insert(lessonData);
    res.status(201).json(newLesson);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating lesson', error: error.message });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const updatedLesson = await Lesson.query().patchAndFetchById(req.params.id, req.body);
    if (!updatedLesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(updatedLesson);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating lesson', error: error.message });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const numDeleted = await Lesson.query().deleteById(req.params.id);
    if (numDeleted === 0) return res.status(404).json({ message: 'Lesson not found' });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting lesson', error: error.message });
  }
};

// --- Shared Controllers ---

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const courses = await Course.query().orderBy('name');
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

export const getCourseDetails = async (req: Request, res: Response) => {
  try {
    const course = await Course.query()
      .findById(req.params.id)
      .withGraphFetched('modules.lessons(orderByOrder)')
      .modifiers({
        orderByOrder(builder) {
          builder.orderBy('order');
        },
      });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching course details', error: error.message });
  }
};

// --- Physiotherapist Controllers ---

export const getMyCourses = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const physiotherapistId = req.user.id;
    const progress = await Progress.query().where('physiotherapist_id', physiotherapistId);
    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching your courses', error: error.message });
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  const trx = await transaction.start(Progress.knex());
  try {
    // @ts-ignore
    const physiotherapistId = req.user.id;
    const { courseId } = req.params;
    const { lessonId } = req.body;

    if (!lessonId) {
      await trx.rollback();
      return res.status(400).json({ message: 'Lesson ID is required.' });
    }

    let progress = await Progress.query(trx).findOne({
      physiotherapist_id: physiotherapistId,
      ead_course_id: courseId,
    });

    if (!progress) {
      progress = await Progress.query(trx).insert({
        physiotherapist_id: physiotherapistId,
        ead_course_id: parseInt(courseId, 10),
        completed_lessons: [lessonId],
        status: 'IN_PROGRESS',
      });
    } else {
      const completed = new Set(progress.completed_lessons);
      completed.add(lessonId);
      progress.completed_lessons = Array.from(completed);
      progress.status = 'IN_PROGRESS';
    }

    const course = await Course.query(trx).findById(courseId).withGraphFetched('modules.lessons');
    if (!course) {
      await trx.rollback();
      return res.status(404).json({ message: 'Course not found' });
    }

    const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
    const completedCount = progress.completed_lessons.length;
    
    if (totalLessons > 0) {
      progress.progress = (completedCount / totalLessons) * 100;
    }
    if (progress.progress >= 100) {
      progress.status = 'COMPLETED';
    }

    const updatedProgress = await Progress.query(trx).patchAndFetchById(progress.id, {
      completed_lessons: progress.completed_lessons,
      progress: progress.progress,
      status: progress.status,
    });

    await trx.commit();
    res.json(updatedProgress);
  } catch (error: any) {
    await trx.rollback();
    res.status(500).json({ message: 'Error updating progress', error: error.message });
  }
};

export const evaluateCourse = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const physiotherapistId = req.user.id;
        const { courseId } = req.params;
        const { evaluation, evaluation_comment } = req.body;

        let progress = await Progress.query().findOne({
            physiotherapist_id: physiotherapistId,
            ead_course_id: courseId,
        });

        if (!progress) {
            return res.status(404).json({ message: 'You have not started this course yet.' });
        }

        const updatedProgress = await Progress.query().patchAndFetchById(progress.id, {
            evaluation,
            evaluation_comment,
        });

        res.json(updatedProgress);
    } catch (error: any) {
        res.status(500).json({ message: 'Error submitting evaluation', error: error.message });
    }
};
