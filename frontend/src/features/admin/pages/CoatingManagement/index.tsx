import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, Select, Tag } from 'antd';
import { Form, Field } from 'react-final-form';
import { Coating } from '@/@types/coating';
import * as CoatingService from '@/http/CoatingHttpService';

const { Title } = Typography;
const { Option } = Select;

const CoatingManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoating, setEditingCoating] = useState<Coating | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: coatings, isLoading } = useQuery<Coating[], Error>({
    queryKey: ['coatings'],
    queryFn: () => CoatingService.getCoatings(),
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

  const columns = [
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Coating Type', dataIndex: 'coating_type', key: 'coating_type', render: (type: string) => <Tag color={type === 'EVA' ? 'blue' : 'green'}>{type}</Tag> },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (active: boolean) => <Switch checked={active} disabled /> },
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
          initialValues={editingCoating || undefined}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="description" render={({ input }) => <AntdForm.Item label="Description" required><Input {...input} /></AntdForm.Item>} />
              <Field name="coating_type" render={({ input }) => <AntdForm.Item label="Coating Type" required><Select {...input}><Option value="EVA">EVA</Option><Option value="Fabric">Fabric</Option></Select></AntdForm.Item>} />
              <Field name="active" type="checkbox" render={({ input }) => <AntdForm.Item label="Active"><Switch {...input} checked={input.checked} /></AntdForm.Item>} />
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
