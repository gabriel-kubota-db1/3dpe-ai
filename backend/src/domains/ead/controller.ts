import { Request, Response } from 'express';
import { transaction } from 'objection';
import { Course } from './course.model';
import { Module } from './module.model';
import { Lesson } from './lesson.model';
import { Progress } from './progress.model';
import { Category } from './category.model';

// --- Category Controllers ---

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.query().insert(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
    const query = Category.query().orderBy('name');

    if (name) {
      query.where('name', 'like', `%${String(name)}%`);
    }

    const categories = await query;
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    // Remove read-only fields that shouldn't be updated
    const { id, created_at, updated_at, ...updateData } = req.body;
    
    const category = await Category.query().patchAndFetchById(req.params.id, updateData);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const numDeleted = await Category.query().deleteById(req.params.id);
    if (numDeleted === 0) return res.status(404).json({ message: 'Category not found' });
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};


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
    // Remove read-only fields that shouldn't be updated
    const { id, created_at, updated_at, ...updateData } = req.body;
    
    const course = await Course.query().patchAndFetchById(req.params.id, updateData);
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
    // Remove read-only fields that shouldn't be updated
    const { id, created_at, updated_at, ...updateData } = req.body;
    
    const updatedModule = await Module.query().patchAndFetchById(req.params.id, updateData);
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
    // Remove read-only fields that shouldn't be updated
    const { id, created_at, updated_at, ...updateData } = req.body;
    
    const updatedLesson = await Lesson.query().patchAndFetchById(req.params.id, updateData);
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

export const reorderModules = async (req: Request, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ message: 'orderedIds must be an array.' });
  }

  const trx = await transaction.start(Module.knex());
  try {
    const updates = orderedIds.map((id, index) =>
      Module.query(trx).findById(id).patch({ order: index })
    );
    await Promise.all(updates);
    await trx.commit();
    res.status(200).json({ message: 'Modules reordered successfully.' });
  } catch (error: any) {
    await trx.rollback();
    res.status(500).json({ message: 'Error reordering modules', error: error.message });
  }
};

export const reorderLessons = async (req: Request, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    return res.status(400).json({ message: 'orderedIds must be an array.' });
  }

  const trx = await transaction.start(Lesson.knex());
  try {
    const updates = orderedIds.map((id, index) =>
      Lesson.query(trx).findById(id).patch({ order: index })
    );
    await Promise.all(updates);
    await trx.commit();
    res.status(200).json({ message: 'Lessons reordered successfully.' });
  } catch (error: any) {
    await trx.rollback();
    res.status(500).json({ message: 'Error reordering lessons', error: error.message });
  }
};


// --- Shared Controllers ---

export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const { search, categoryId } = req.query;
    const query = Course.query().withGraphFetched('category').orderBy('name');

    if (search) {
      const searchTerm = String(search);
      query.where(builder => {
        builder.where('name', 'like', `%${searchTerm}%`)
               .orWhere('description', 'like', `%${searchTerm}%`);
      });
    }

    if (categoryId) {
      query.where('category_id', Number(categoryId));
    }

    const courses = await query;
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

export const getCourseDetails = async (req: Request, res: Response) => {
  try {
    const course = await Course.query()
      .findById(req.params.id)
      .withGraphFetched('[modules(orderByOrder).lessons(orderByOrder), category]')
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
  // @ts-ignore
  const physiotherapistId = req.user.id;
  const trx = await transaction.start(Progress.knex());

  try {
    // 1. Fetch all progress records for the user
    const userProgressList = await Progress.query(trx).where('physiotherapist_id', physiotherapistId);

    if (userProgressList.length === 0) {
      await trx.commit();
      return res.json([]);
    }

    // 2. Get course IDs
    const courseIds = userProgressList.map(p => p.ead_course_id);

    // 3. Fetch all relevant courses and their lesson counts
    const courses = await Course.query(trx)
      .whereIn('id', courseIds)
      .withGraphFetched('modules.lessons');

    // 4. Create a map of courseId -> totalLessons
    const lessonCounts = courses.reduce((acc, course) => {
      const totalLessons = course.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;
      acc[course.id] = totalLessons;
      return acc;
    }, {} as Record<number, number>);

    // 5. Recalculate progress for each record and update if necessary
    const updatedProgressList = await Promise.all(userProgressList.map(async (progress) => {
      const totalLessons = lessonCounts[progress.ead_course_id] || 0;
      const completedCount = progress.completed_lessons.length;
      
      let newProgressPercentage = 0;
      if (totalLessons > 0) {
        newProgressPercentage = Math.round((completedCount / totalLessons) * 100);
      }

      let newStatus = progress.status;
      if (newProgressPercentage >= 100) {
        newStatus = 'COMPLETED';
      } else if (completedCount > 0) {
        newStatus = 'IN_PROGRESS';
      } else {
        newStatus = 'NOT_STARTED';
      }

      // If the calculated progress or status is different from the stored one, update it.
      if (progress.progress !== newProgressPercentage || progress.status !== newStatus) {
        await Progress.query(trx).findById(progress.id).patch({ 
          progress: newProgressPercentage,
          status: newStatus,
        });
        progress.progress = newProgressPercentage; // update in-memory object
        progress.status = newStatus;
      }

      return progress;
    }));
    
    await trx.commit();
    res.json(updatedProgressList);

  } catch (error: any) {
    await trx.rollback();
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
    }

    const course = await Course.query(trx).findById(courseId).withGraphFetched('modules.lessons');
    if (!course) {
      await trx.rollback();
      return res.status(404).json({ message: 'Course not found' });
    }

    const totalLessons = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
    const completedCount = progress.completed_lessons.length;
    
    let newProgressPercentage = 0;
    if (totalLessons > 0) {
      newProgressPercentage = Math.round((completedCount / totalLessons) * 100);
    }

    let newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'IN_PROGRESS';
    if (newProgressPercentage >= 100) {
      newStatus = 'COMPLETED';
    }

    const updatedProgress = await Progress.query(trx).patchAndFetchById(progress.id, {
      completed_lessons: progress.completed_lessons,
      progress: newProgressPercentage,
      status: newStatus,
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
