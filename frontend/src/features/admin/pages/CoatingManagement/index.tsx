import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, Select, Tag, Row, Col } from 'antd';
import { Form, Field } from 'react-final-form';
import { Coating } from '@/@types/coating';
import * as CoatingService from '@/http/CoatingHttpService';
import { useDebounce } from '@/hooks/useDebounce';

const { Title } = Typography;
const { Option } = Select;

const CoatingManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoating, setEditingCoating] = useState<Coating | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const [descriptionFilter, setDescriptionFilter] = useState('');
  const debouncedDescription = useDebounce(descriptionFilter, 500);

  const [filters, setFilters] = useState<{
    coating_type?: string;
    active?: string;
    description?: string;
  }>({ description: '' });

  useEffect(() => {
    setFilters((prevFilters) => ({ ...prevFilters, description: debouncedDescription }));
  }, [debouncedDescription]);

  const { data: coatings, isLoading } = useQuery<Coating[], Error>({
    queryKey: ['coatings', filters],
    queryFn: () => CoatingService.getCoatings(filters),
  });

  const { mutate: createOrUpdateCoating, isPending: isSaving } = useMutation({
    mutationFn: (values: Omit<Coating, 'id'> | Coating) => {
      if ('id' in values && values.id) {
        return CoatingService.updateCoating(values.id, values);
      }
      return CoatingService.createCoating(values as Omit<Coating, 'id'>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coatings'] });
      message.success(`Coating ${editingCoating ? 'updated' : 'created'} successfully!`);
      closeModal();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to save coating.');
    },
  });

  const { mutate: deleteCoating } = useMutation({
    mutationFn: (id: number) => CoatingService.deleteCoating(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coatings'] });
      message.success('Coating deleted successfully!');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete coating.');
    },
  });

  const showModal = (coating: Coating | null = null) => {
    setEditingCoating(coating);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCoating(null);
    setIsModalOpen(false);
  };

  const onSubmit = (values: Omit<Coating, 'id'>) => {
    createOrUpdateCoating(editingCoating ? { ...values, id: editingCoating.id } : values);
  };

  const handleFilterChange = (changedValues: any, allValues: any) => {
    if ('description' in changedValues) {
      setDescriptionFilter(changedValues.description);
    } else {
      setFilters(allValues);
    }
  };

  const columns = [
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Coating Type', dataIndex: 'coating_type', key: 'coating_type', render: (type: string) => <Tag color={type === 'EVA' ? 'blue' : 'green'}>{type}</Tag> },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),},
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Coating) => (
        <Space size="middle">
          <Button onClick={() => showModal(record)}>Edit</Button>
          <Popconfirm
            title="Delete the coating"
            description="Are you sure to delete this coating?"
            onConfirm={() => deleteCoating(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>Coating Management</Title>
        <Button type="primary" onClick={() => showModal()}>
          Add Coating
        </Button>
      </div>

      <AntdForm
        layout="vertical"
        onValuesChange={handleFilterChange}
        style={{ marginBottom: 24, padding: 24, backgroundColor: '#fbfbfb', border: '1px solid #d9d9d9', borderRadius: 6 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <AntdForm.Item name="coating_type" label="Filter by Type">
              <Select placeholder="Select a type" allowClear>
                <Option value="ALL">All Types</Option>
                <Option value="EVA">EVA</Option>
                <Option value="Fabric">Fabric</Option>
              </Select>
            </AntdForm.Item>
          </Col>
          <Col span={8}>
            <AntdForm.Item name="active" label="Filter by Status">
              <Select placeholder="Select a status" allowClear>
                <Option value="ALL">All Statuses</Option>
                <Option value="true">Active</Option>
                <Option value="false">Inactive</Option>
              </Select>
            </AntdForm.Item>
          </Col>
          <Col span={8}>
            <AntdForm.Item name="description" label="Search by Description">
              <Input placeholder="Enter description" allowClear />
            </AntdForm.Item>
          </Col>
        </Row>
      </AntdForm>

      <Table dataSource={coatings} columns={columns} loading={isLoading} rowKey="id" />

      <Modal
        title={editingCoating ? 'Edit Coating' : 'Add Coating'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form
          onSubmit={onSubmit}
          initialValues={editingCoating || { active: true }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="description" render={({ input }) => <AntdForm.Item label="Description" required><Input {...input} /></AntdForm.Item>} />
              <Field name="coating_type" render={({ input }) => <AntdForm.Item label="Coating Type" required><Select {...input}><Option value="EVA">EVA</Option><Option value="Fabric">Fabric</Option></Select></AntdForm.Item>} />
              <Field name="active" initialValue={true} type="checkbox" render={({ input }) => <AntdForm.Item label="Active"><Switch {...input} checked={input.checked} /></AntdForm.Item>} />
              <div style={{ textAlign: 'right', marginTop: 24 }}>
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

export default CoatingManagementPage;
