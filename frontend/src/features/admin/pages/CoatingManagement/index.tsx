import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, InputNumber, Select, Tag } from 'antd';
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
    { title: 'Coating Type', dataIndex: 'coating_type', key: 'coating_type', render: (type: string) => <Tag color={type === 'EVA' ? 'blue' : 'green'}>{type}</Tag> },
    { title: 'Product Type', dataIndex: 'type', key: 'type' },
    { title: 'Number Range', dataIndex: 'number_range', key: 'number_range' },
    { title: 'Cost (R$)', dataIndex: 'cost_value', key: 'cost_value' },
    { title: 'Sell (R$)', dataIndex: 'sell_value', key: 'sell_value' },
    { title: 'Weight (g)', dataIndex: 'weight', key: 'weight' },
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
          initialValues={editingCoating || { description: '', active: true, coating_type: 'EVA', type: 'INSOLE' }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="description" render={({ input }) => <AntdForm.Item label="Description" required><Input {...input} /></AntdForm.Item>} />
              <Field name="coating_type" render={({ input }) => <AntdForm.Item label="Coating Type" required><Select {...input}><Option value="EVA">EVA</Option><Option value="Fabric">Fabric</Option></Select></AntdForm.Item>} />
              <Field name="type" render={({ input }) => <AntdForm.Item label="Product Type" required><Select {...input}><Option value="INSOLE">INSOLE</Option><Option value="SLIPPER">SLIPPER</Option><Option value="ELEMENT">ELEMENT</Option></Select></AntdForm.Item>} />
              <Field name="number_range" render={({ input }) => <AntdForm.Item label="Number Range" required><Input {...input} placeholder="e.g., 34-38" /></AntdForm.Item>} />
              <Field name="cost_value" render={({ input }) => <AntdForm.Item label="Cost Value (R$)" required><InputNumber {...input} style={{ width: '100%' }} min={0} precision={2} /></AntdForm.Item>} />
              <Field name="sell_value" render={({ input }) => <AntdForm.Item label="Sell Value (R$)" required><InputNumber {...input} style={{ width: '100%' }} min={0} precision={2} /></AntdForm.Item>} />
              <Field name="weight" render={({ input }) => <AntdForm.Item label="Weight (grams)" required><InputNumber {...input} style={{ width: '100%' }} min={0} /></AntdForm.Item>} />
              <Field name="active" type="checkbox" render={({ input }) => <AntdForm.Item label="Active"><Switch {...input} checked={input.checked} /></AntdForm.Item>} />
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

export default CoatingManagementPage;
