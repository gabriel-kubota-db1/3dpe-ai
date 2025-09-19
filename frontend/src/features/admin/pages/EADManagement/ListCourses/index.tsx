import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Input, Form as AntdForm, App, Typography, Popconfirm, Tooltip, Select, Empty, Table } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReadOutlined } from '@ant-design/icons';
import { Form, Field } from 'react-final-form';
import { Link } from 'react-router-dom';
import * as EadService from '@/http/EadHttpService';
import { Course, Category } from '@/@types/ead';

const { Title } = Typography;

const EADCourseListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: courses, isLoading } = useQuery<Course[], Error>({
    queryKey: ['eadCourses'],
    queryFn: EadService.getAllCourses,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[], Error>({
    queryKey: ['eadCategories'],
    queryFn: EadService.getCategories,
  });

  const { mutate: saveCourse, isPending: isSaving } = useMutation({
    mutationFn: (values: Course | Omit<Course, 'id'>) => {
      if ('id' in values) {
        return EadService.updateCourse(values.id, values);
      }
      return EadService.createCourse(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eadCourses'] });
      message.success(`Course ${editingCourse ? 'updated' : 'created'} successfully!`);
      closeModal();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to save course.');
    },
  });

  const { mutate: deleteCourse } = useMutation({
    mutationFn: (id: number) => EadService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eadCourses'] });
      message.success('Course deleted successfully!');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete course.');
    },
  });

  const showModal = (course: Course | null = null) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCourse(null);
    setIsModalOpen(false);
  };

  const onSubmit = (values: any) => {
    const payload = { ...values, category_id: values.category_id || null };
    saveCourse(editingCourse ? { ...payload, id: editingCourse.id } : payload);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: Category) => category?.name || 'Uncategorized',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description ? description.substring(0, 100) + (description.length > 100 ? '...' : '') : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Course) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="Manage Content">
            <Link to={`/admin/ead/courses/${record.id}`}>
              <Button icon={<ReadOutlined />} size="small" />
            </Link>
          </Tooltip>
          <Tooltip title="Edit Course">
            <Button icon={<EditOutlined />} size="small" onClick={() => showModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete this course?"
            description="This action is irreversible."
            onConfirm={() => deleteCourse(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>EAD Course Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          New Course
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        loading={isLoading}
        rowKey="id"
        locale={{
          emptyText: (
            <Empty 
              description="No courses found. Click 'New Course' to add one." 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
      />

      <Modal
        title={editingCourse ? 'Edit Course' : 'New Course'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form
          onSubmit={onSubmit}
          initialValues={editingCourse ? { ...editingCourse, category_id: editingCourse.category_id } : {}}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="name"
                validate={value => (value ? undefined : 'Name is required')}
              >
                {({ input, meta }) => (
                  <AntdForm.Item label="Name" required validateStatus={meta.touched && meta.error ? 'error' : ''} help={meta.touched && meta.error}>
                    <Input {...input} />
                  </AntdForm.Item>
                )}
              </Field>
              <Field name="category_id">
                {({ input }) => (
                  <AntdForm.Item label="Category">
                    <Select {...input} loading={isLoadingCategories} placeholder="Select a category" allowClear>
                      {categories?.map(cat => (
                        <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
                      ))}
                    </Select>
                  </AntdForm.Item>
                )}
              </Field>
              <Field name="description">
                {({ input }) => <AntdForm.Item label="Description"><Input.TextArea {...input} rows={4} /></AntdForm.Item>}
              </Field>
              <Field name="cover_url">
                {({ input }) => <AntdForm.Item label="Cover Image URL"><Input {...input} placeholder="https://example.com/image.png" /></AntdForm.Item>}
              </Field>
              <div style={{ textAlign: 'right' }}>
                <Button onClick={closeModal} style={{ marginRight: 8 }}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isSaving}>Save</Button>
              </div>
            </form>
          )}
        />
      </Modal>
    </div>
  );
};

export default EADCourseListPage;
