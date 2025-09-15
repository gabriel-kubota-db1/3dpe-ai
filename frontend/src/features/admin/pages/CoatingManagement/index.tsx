import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography } from 'antd';
import { Form, Field } from 'react-final-form';
import { Coating } from '@/@types/coating';
import * as CoatingService from '@/http/CoatingHttpService';

const { Title } = Typography;

const CoatingManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoating, setEditingCoating] = useState<Coating | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: coatings, isLoading } = useQuery<Coating[], Error>({
    queryKey: ['coatings'],
    queryFn: CoatingService.getCoatings,
  });

  const { mutate: createOrUpdateCoating, isPending: isSaving } = useMutation({
    mutationFn: (values: Omit<Coating, 'id'> | Coating) => {
      if ('id' in values) {
        return CoatingService.updateCoating(values.id, values);
      }
      return CoatingService.createCoating(values);
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
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => <Switch checked={active} disabled />,
    },
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
          initialValues={editingCoating || { description: '', active: true }}
          render={({ handleSubmit, form }) => (
            <form onSubmit={handleSubmit}>
              <Field name="description">
                {({ input, meta }) => (
                  <AntdForm.Item
                    label="Description"
                    validateStatus={meta.touched && meta.error ? 'error' : ''}
                    help={meta.touched && meta.error}
                  >
                    <Input {...input} placeholder="Enter coating description" />
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

export default CoatingManagementPage;
