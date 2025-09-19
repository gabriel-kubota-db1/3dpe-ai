import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, List, Typography, Popconfirm, Tooltip, App, Card, Collapse, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DragOutlined, VideoCameraOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as EadService from '@/http/EadHttpService';
import { Course, Module, Lesson } from '@/@types/ead';
import ModuleFormModal from './ModuleFormModal';
import LessonFormModal from './LessonFormModal';

const { Text } = Typography;

interface CourseStructureManagerProps {
  course: Course;
  onStructureUpdate: () => void;
}

interface SortableModuleItemProps {
  module: Module;
  courseId: number;
  onEdit: (module: Module) => void;
  onDelete: (id: number) => void;
  onAddLesson: (module: Module) => void;
  onEditLesson: (lesson: Lesson, module: Module) => void;
  onDeleteLesson: (id: number) => void;
  onReorderLessons: (moduleId: number, oldIndex: number, newIndex: number) => void;
}

const SortableLessonItem = ({ lesson, onEdit, onDelete }: { lesson: Lesson, onEdit: () => void, onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '12px',
    marginBottom: '8px',
    backgroundColor: '#fafafa',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Space>
        <Tooltip title="Drag to reorder">
          <DragOutlined {...listeners} style={{ cursor: 'grab' }} />
        </Tooltip>
        <VideoCameraOutlined />
        <Text>{lesson.title}</Text>
        {lesson.duration && <Tag>{Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s</Tag>}
      </Space>
      <Space>
        <Tooltip title="Edit Lesson">
          <Button size="small" icon={<EditOutlined />} onClick={onEdit} />
        </Tooltip>
        <Popconfirm title="Delete this lesson?" onConfirm={onDelete}>
          <Tooltip title="Delete Lesson">
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Tooltip>
        </Popconfirm>
      </Space>
    </div>
  );
};

const SortableModuleItem = ({ module, onEdit, onDelete, onAddLesson, onEditLesson, onDeleteLesson, onReorderLessons }: SortableModuleItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = module.lessons?.findIndex(l => l.id === active.id) ?? -1;
      const newIndex = module.lessons?.findIndex(l => l.id === over.id) ?? -1;
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorderLessons(module.id, oldIndex, newIndex);
      }
    }
  };

  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <Space>
        <Tooltip title="Drag to reorder">
          <DragOutlined {...listeners} style={{ cursor: 'grab' }} />
        </Tooltip>
        <Text strong>{module.title}</Text>
      </Space>
      <Space onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Add Lesson">
          <Button size="small" icon={<PlusOutlined />} onClick={() => onAddLesson(module)}>Lesson</Button>
        </Tooltip>
        <Tooltip title="Edit Module">
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(module)} />
        </Tooltip>
        <Popconfirm title="Delete this module?" onConfirm={() => onDelete(module.id)}>
          <Tooltip title="Delete Module">
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Tooltip>
        </Popconfirm>
      </Space>
    </div>
  );

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Collapse>
        <Collapse.Panel header={header} key={module.id}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={module.lessons?.map(l => l.id) || []} strategy={verticalListSortingStrategy}>
              {module.lessons?.map(lesson => (
                <SortableLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={() => onEditLesson(lesson, module)}
                  onDelete={() => onDeleteLesson(lesson.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

const CourseStructureManager = ({ course, onStructureUpdate }: CourseStructureManagerProps) => {
  const [modules, setModules] = useState<Module[]>(course.modules || []);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [parentModule, setParentModule] = useState<Module | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  // Sync local modules state when course data changes
  useEffect(() => {
    setModules(course.modules || []);
  }, [course.modules]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Mutations ---
  const mutationOptions = {
    onSuccess: () => {
      onStructureUpdate();
      queryClient.invalidateQueries({ queryKey: ['eadCourseDetails', course.id] });
    },
    onError: (error: Error) => message.error(error.message || 'An error occurred'),
  };

  const { mutate: saveModule } = useMutation({
    mutationFn: (values: Omit<Module, 'id' | 'ead_course_id' | 'lessons'>) =>
      editingModule
        ? EadService.updateModule(editingModule.id, values)
        : EadService.createModule(course.id, { ...values, order: modules.length }),
    onSuccess: () => {
      onStructureUpdate();
      queryClient.invalidateQueries({ queryKey: ['eadCourseDetails', course.id] });
      message.success({
        content: editingModule 
          ? 'Module updated successfully! The module list has been refreshed.' 
          : 'Module created successfully! The module list has been refreshed.',
        duration: 4
      });
      setIsModuleModalOpen(false);
    },
    onError: (error: Error) => message.error(error.message || 'An error occurred'),
  });

  const { mutate: deleteModule } = useMutation({
    mutationFn: EadService.deleteModule,
    ...mutationOptions,
  });

  const { mutate: saveLesson } = useMutation({
    mutationFn: (values: Omit<Lesson, 'id' | 'ead_module_id'>) =>
      editingLesson
        ? EadService.updateLesson(editingLesson.id, values)
        : EadService.createLesson(parentModule!.id, { ...values, order: parentModule?.lessons?.length || 0 }),
    onSuccess: () => {
      onStructureUpdate();
      queryClient.invalidateQueries({ queryKey: ['eadCourseDetails', course.id] });
      message.success(editingLesson ? 'Lesson updated successfully!' : 'Lesson created successfully! The course structure has been updated.');
      setIsLessonModalOpen(false);
    },
    onError: (error: Error) => message.error(error.message || 'An error occurred'),
  });

  const { mutate: deleteLesson } = useMutation({
    mutationFn: EadService.deleteLesson,
    ...mutationOptions,
  });

  const { mutate: reorderModules } = useMutation({
    mutationFn: (orderedIds: number[]) => EadService.reorderModules(course.id, orderedIds),
    ...mutationOptions,
  });

  const { mutate: reorderLessons } = useMutation({
    mutationFn: ({ moduleId, orderedIds }: { moduleId: number, orderedIds: number[] }) => EadService.reorderLessons(moduleId, orderedIds),
    ...mutationOptions,
  });

  // --- Handlers ---
  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex(m => m.id === active.id);
      const newIndex = modules.findIndex(m => m.id === over.id);
      const newOrder = arrayMove(modules, oldIndex, newIndex);
      setModules(newOrder);
      reorderModules(newOrder.map(m => m.id));
    }
  };

  const handleLessonReorder = (moduleId: number, oldIndex: number, newIndex: number) => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return;

    const newModules = [...modules];
    const newLessons = arrayMove(newModules[moduleIndex].lessons!, oldIndex, newIndex);
    newModules[moduleIndex] = { ...newModules[moduleIndex], lessons: newLessons };
    setModules(newModules);
    reorderLessons({ moduleId, orderedIds: newLessons.map(l => l.id) });
  };

  return (
    <Card
      title="Course Structure"
      extra={<Button icon={<PlusOutlined />} onClick={() => { setEditingModule(null); setIsModuleModalOpen(true); }}>New Module</Button>}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
        <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
          {modules.map(module => (
            <SortableModuleItem
              key={module.id}
              module={module}
              courseId={course.id}
              onEdit={mod => { setEditingModule(mod); setIsModuleModalOpen(true); }}
              onDelete={deleteModule}
              onAddLesson={mod => { setParentModule(mod); setEditingLesson(null); setIsLessonModalOpen(true); }}
              onEditLesson={(lesson, mod) => { setParentModule(mod); setEditingLesson(lesson); setIsLessonModalOpen(true); }}
              onDeleteLesson={deleteLesson}
              onReorderLessons={handleLessonReorder}
            />
          ))}
        </SortableContext>
      </DndContext>

      <ModuleFormModal
        open={isModuleModalOpen}
        onCancel={() => setIsModuleModalOpen(false)}
        onFinish={saveModule}
        initialValues={editingModule}
      />

      <LessonFormModal
        open={isLessonModalOpen}
        onCancel={() => setIsLessonModalOpen(false)}
        onFinish={saveLesson}
        initialValues={editingLesson}
      />
    </Card>
  );
};

export default CourseStructureManager;
