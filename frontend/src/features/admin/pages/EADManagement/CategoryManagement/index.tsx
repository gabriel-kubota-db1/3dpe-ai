import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Input, Form as AntdForm, App, Card, Typography, Popconfirm, Space, Table, Tooltip, Form, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Form as FinalForm, Field } from 'react-final-form';
import * as EadService from '@/http/EadHttpService';
import { Category } from '@/@types/ead';
import { useDebounce } from '@/hooks/useDebounce';

const { Title } = Typography;

const CategoryManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState<{ name?: string }>({
    name: undefined,
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, name: debouncedSearchTerm || undefined }));
  }, [debouncedSearchTerm]);

  const { data: categories, isLoading } = useQuery<Category[], Error>({
    queryKey: ['eadCategories', filters],
    queryFn: () => EadService.getCategories(filters),
  });

  const { mutate: saveCategory, isPending: isSaving } = useMutation({
    mutationFn: (values: Category | Omit<Category, 'id'>) => {
      if ('id' in values) {
        return EadService.updateCategory(values.id, values);
      }
      return EadService.createCategory(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eadCategories'] });
      message.success(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
      closeModal();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to save category.');
    },
  });

  const { mutate: deleteCategory } = useMutation({
    mutationFn: (id: number) => EadService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eadCategories'] });
      message.success('Category deleted successfully!');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete category.');
    },
  });

  const showModal = (category: Category | null = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const onSubmit = (values: { name: string }) => {
    saveCategory(editingCategory ? { ...values, id: editingCategory.id } : values);
  };

  const handleValuesChange = (changedValues: any) => {
    if ('name' in changedValues) {
      setSearchTerm(changedValues.name);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Tooltip title="Edit Category">
            <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete this category?"
            description="This action is irreversible."
            onConfirm={() => deleteCategory(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Category">
              <Button icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>Category Management</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
          New Category
        </Button>
      </div>

      <Form form={form} layout="vertical" onValuesChange={handleValuesChange} style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="name" label="Filter by Name">
              <Input placeholder="Enter category name" allowClear />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        columns={columns}
        dataSource={categories}
        loading={isLoading}
        rowKey="id"
      />

      <Modal
        title={editingCategory ? 'Edit Category' : 'New Category'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <FinalForm
          onSubmit={onSubmit}
          initialValues={editingCategory || {}}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field
                name="name"
                validate={value => (value ? undefined : 'Name is required')}
              >
                {({ input, meta }) => (
                  <AntdForm.Item
                    label="Name"
                    required
                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                    help={meta.touched && meta.error}
                  >
                    <Input {...input} />
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
    </Card>
  );
};

export default CategoryManagement;
