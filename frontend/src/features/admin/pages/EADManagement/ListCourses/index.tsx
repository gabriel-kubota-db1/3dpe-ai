import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Input, Form as AntdForm, App, Card, Row, Col, Typography, Popconfirm, Space, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReadOutlined } from '@ant-design/icons';
import { Form, Field } from 'react-final-form';
import { Link } from 'react-router-dom';
import * as EadService from '@/http/EadHttpService';
import { Course } from '@/@types/ead';

const { Title } = Typography;
const { Meta } = Card;

const EADCourseListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: courses, isLoading } = useQuery<Course[], Error>({
    queryKey: ['eadCourses'],
    queryFn: EadService.getAllCourses,
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
    saveCourse(editingCourse ? { ...values, id: editingCourse.id } : values);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>EAD Course Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          New Course
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {courses?.map(course => (
          <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
            <Card
              hoverable
              cover={<img alt={course.name} src={course.cover_url || 'https://via.placeholder.com/300x200?text=No+Image'} style={{ height: 200, objectFit: 'cover' }} />}
              actions={[
                <Tooltip title="Manage Content"><Link to={`/admin/ead/courses/${course.id}`}><ReadOutlined key="manage" /></Link></Tooltip>,
                <Tooltip title="Edit Course"><EditOutlined key="edit" onClick={() => showModal(course)} /></Tooltip>,
                <Popconfirm
                  title="Delete this course?"
                  description="This action is irreversible."
                  onConfirm={() => deleteCourse(course.id)}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteOutlined key="delete" />
                </Popconfirm>,
              ]}
            >
              <Meta title={course.name} description={course.category} />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingCourse ? 'Edit Course' : 'New Course'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form
          onSubmit={onSubmit}
          initialValues={editingCourse || {}}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="name">
                {({ input }) => <AntdForm.Item label="Name" required><Input {...input} /></AntdForm.Item>}
              </Field>
              <Field name="category">
                {({ input }) => <AntdForm.Item label="Category" required><Input {...input} /></AntdForm.Item>}
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
