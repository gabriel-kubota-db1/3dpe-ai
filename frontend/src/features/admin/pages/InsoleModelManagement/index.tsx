import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, InputNumber } from 'antd';
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
    mutationFn: (values: Partial<InsoleModel>) => {
      if (values.id) {
        return InsoleModelService.updateInsoleModel(values.id, values);
      }
      return InsoleModelService.createInsoleModel(values as any);
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

  const onSubmit = (values: Omit<InsoleModel, 'id' | 'created_at' | 'updated_at'>) => {
    const payload = { ...values };
    if (payload.coating_id === '') {
      payload.coating_id = null;
    }
    
    createOrUpdateModel(editingModel ? { ...payload, id: editingModel.id } : payload);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a: InsoleModel, b: InsoleModel) => a.id - b.id },
    { title: 'Description', dataIndex: 'description', key: 'description', sorter: (a: InsoleModel, b: InsoleModel) => a.description.localeCompare(b.description) },
    { title: 'Coating ID', dataIndex: 'coating_id', key: 'coating_id' },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => <Switch checked={active} disabled />,
    },
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
          initialValues={editingModel || { description: '', coating_id: null, active: true }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="description" validate={value => (value ? undefined : 'Description is required')}>
                {({ input, meta }) => (
                  <AntdForm.Item
                    label="Description"
                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                    help={meta.touched && meta.error}
                    required
                  >
                    <Input {...input} placeholder="Enter model description" />
                  </AntdForm.Item>
                )}
              </Field>
              <Field name="coating_id">
                {({ input }) => (
                  <AntdForm.Item label="Coating ID (Optional)">
                    <InputNumber {...input} style={{ width: '100%' }} placeholder="Enter coating ID" />
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
              <div style={{ textAlign: 'right', marginTop: '24px' }}>
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
