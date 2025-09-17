import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, Tag } from 'antd';
import { Form, Field } from 'react-final-form';
import { InsoleModel } from '@/@types/insoleModel';
import * as InsoleModelService from '@/http/InsoleModelHttpService';

const { Title } = Typography;

const InsoleModelManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<InsoleModel | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: insoleModels, isLoading } = useQuery<InsoleModel[], Error>({
    queryKey: ['insoleModels'],
    queryFn: InsoleModelService.getInsoleModels,
  });

  const { mutate: createOrUpdateModel, isPending: isSaving } = useMutation({
    mutationFn: (values: Omit<InsoleModel, 'id'> | InsoleModel) => {
      if ('id' in values) {
        return InsoleModelService.updateInsoleModel(values.id, values);
      }
      return InsoleModelService.createInsoleModel(values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insoleModels'] });
      message.success(`Insole Model ${editingModel ? 'updated' : 'created'} successfully!`);
      closeModal();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to save insole model.');
    },
  });

  const { mutate: deleteModel } = useMutation({
    mutationFn: (id: number) => InsoleModelService.deleteInsoleModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insoleModels'] });
      message.success('Insole Model deleted successfully!');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete insole model.');
    },
  });

  const showModal = (model: InsoleModel | null = null) => {
    setEditingModel(model);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingModel(null);
    setIsModalOpen(false);
  };

  const onSubmit = (values: Omit<InsoleModel, 'id'>) => {
    createOrUpdateModel(editingModel ? { ...values, id: editingModel.id } : values);
  };

  const columns = [
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Coating', dataIndex: 'coating', key: 'coating', render: (_: any, record: InsoleModel) => record.coating ? <Tag>{record.coating.description}</Tag> : '-' },
    { title: 'Coating Type', key: 'coating_type', render: (_: any, record: InsoleModel) => record.coating ? <Tag color={record.coating.coating_type === 'EVA' ? 'blue' : 'green'}>{record.coating.coating_type}</Tag> : '-' },
    { title: 'Number Range', dataIndex: 'number_range', key: 'number_range' },
    { title: 'Cost Value (R$)', dataIndex: 'cost_value', key: 'cost_value', render: (value: number) => `R$ ${Number(value).toFixed(2)}` },
    { title: 'Sell Value (R$)', dataIndex: 'sell_value', key: 'sell_value', render: (value: number) => `R$ ${Number(value).toFixed(2)}` },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),},
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: InsoleModel) => (
        <Space size="middle">
          <Button onClick={() => showModal(record)}>Edit</Button>
          <Popconfirm
            title="Delete the insole model"
            description="Are you sure to delete this model?"
            onConfirm={() => deleteModel(record.id)}
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
        <Title level={3}>Insole Model Management</Title>
        <Button type="primary" onClick={() => showModal()}>
          Add Insole Model
        </Button>
      </div>
      <Table dataSource={insoleModels} columns={columns} loading={isLoading} rowKey="id" />

      <Modal
        title={editingModel ? 'Edit Insole Model' : 'Add Insole Model'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form
          onSubmit={onSubmit}
          initialValues={editingModel || { description: '', active: true }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="description">
                {({ input, meta }) => (
                  <AntdForm.Item
                    label="Description"
                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                    help={meta.touched && meta.error}
                  >
                    <Input {...input} placeholder="Enter model description" />
                  </AntdForm.Item>
                )}
              </Field>
              <Field name="active" type="checkbox">
                {({ input }) => (
                  <AntdForm.Item label="Active">
                    <Switch {...input} checked={input.checked} />
                  </AntdForm.Item>
                )}
              </Field>
              <div style={{ textAlign: 'right' }}>
                <Button onClick={closeModal} style={{ marginRight: 8 }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={isSaving}>
                  Save
                </Button>
              </div>
            </form>
          )}
        />
      </Modal>
    </div>
  );
};

export default InsoleModelManagementPage;
