import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Input, Form as AntdForm, App, Card, Row, Col, Typography, Popconfirm, Tooltip, Select, Empty, Tag, Switch, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReadOutlined } from '@ant-design/icons';
import { Form as FinalForm, Field } from 'react-final-form';
import { Link } from 'react-router-dom';
import * as EadService from '@/http/EadHttpService';
import { Course, Category } from '@/@types/ead';
import { useDebounce } from '@/hooks/useDebounce';

const { Title } = Typography;
const { Meta } = Card;
const { Option } = Select;

const EADCourseListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState<{ search?: string; categoryId?: number }>({
    search: undefined,
    categoryId: undefined,
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm || undefined }));
  }, [debouncedSearchTerm]);

  const { data: courses, isLoading } = useQuery<Course[], Error>({
    queryKey: ['eadCourses', filters],
    queryFn: () => EadService.getAllCourses(filters),
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[], Error>({
    queryKey: ['eadCategories'],
    queryFn: () => EadService.getCategories(), // Fetch all for dropdown
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
    const { created_at, updated_at, ...cleanValues } = values;
    const payload = { 
      ...cleanValues, 
      category_id: cleanValues.category_id || null,
      status: Boolean(cleanValues.status)
    };
    saveCourse(editingCourse ? { ...payload, id: editingCourse.id } : payload);
  };

  const handleValuesChange = (changedValues: any) => {
    if ('search' in changedValues) {
      setSearchTerm(changedValues.search);
    } else {
      setFilters(prev => ({ ...prev, ...changedValues }));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>EAD Course Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          New Course
        </Button>
      </div>

      <Form form={form} layout="vertical" onValuesChange={handleValuesChange} style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={20}>
            <Form.Item name="search">
              <Input placeholder="Enter name or description" allowClear />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="categoryId">
              <Select placeholder="Select a category" loading={isLoadingCategories} allowClear>
                {categories?.map(cat => (
                  <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {!isLoading && (!courses || courses.length === 0) ? (
        <Empty description="No courses found. Click 'New Course' to add one." />
      ) : (
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
                <Meta
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{course.name}</span>
                      <Tag color={course.status ? 'green' : 'red'}>{course.status ? 'ACTIVE' : 'INACTIVE'}</Tag>
                    </div>
                  }
                  description={course.category?.name || 'Uncategorized'}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingCourse ? 'Edit Course' : 'New Course'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <FinalForm
          onSubmit={onSubmit}
          initialValues={editingCourse ? { ...editingCourse, status: Boolean(editingCourse.status) } : { status: true }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="name" validate={value => (value ? undefined : 'Name is required')}>
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
              <Field name="status" fieldType="checkbox">
                {({ input }) => (
                  <AntdForm.Item label="Status">
                    <Switch 
                      checked={input.checked} 
                      onChange={input.onChange}
                      checkedChildren="Active" 
                      unCheckedChildren="Inactive" 
                    />
                  </AntdForm.Item>
                )}
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
