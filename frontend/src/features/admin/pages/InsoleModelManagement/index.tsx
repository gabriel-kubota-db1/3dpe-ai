import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, Select, Tag, Row, Col, InputNumber } from 'antd';
import { Form, Field } from 'react-final-form';
import { InsoleModel } from '@/@types/insoleModel';
import * as InsoleModelService from '@/http/InsoleModelHttpService';
import { useDebounce } from '@/hooks/useDebounce';
import { Coating } from '@/@types/coating';
import * as CoatingService from '@/http/CoatingHttpService';

const { Title } = Typography;
const { Option } = Select;

const modelTypeOptions = [
  { value: 'SPORT', label: 'Sport' },
  { value: 'COMFORT', label: 'Comfort' },
  { value: 'DAILY', label: 'Daily' },
];

const InsoleModelManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<InsoleModel | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const [antdFilterForm] = AntdForm.useForm();
  const [description, setDescription] = useState('');
  const debouncedDescription = useDebounce(description, 500);

  const [filters, setFilters] = useState<{
    model_type?: string;
    active?: string;
    description?: string;
  }>({});

  useEffect(() => {
    setFilters(prev => ({ ...prev, description: debouncedDescription || undefined }));
  }, [debouncedDescription]);

  const { data: models, isLoading } = useQuery<InsoleModel[], Error>({
    queryKey: ['insoleModels', filters],
    queryFn: () => InsoleModelService.getInsoleModels(filters),
  });

  const { data: evaCoatings } = useQuery<Coating[], Error>({
    queryKey: ['coatings', 'EVA'],
    queryFn: () => CoatingService.getCoatings({ coating_type: 'EVA' }),
  });

  const { data: fabricCoatings } = useQuery<Coating[], Error>({
    queryKey: ['coatings', 'Fabric'],
    queryFn: () => CoatingService.getCoatings({ coating_type: 'Fabric' }),
  });

  const { mutate: createOrUpdateModel, isPending: isSaving } = useMutation({
    mutationFn: (values: Omit<InsoleModel, 'id'> | InsoleModel) => {
      if ('id' in values && values.id) {
        return InsoleModelService.updateInsoleModel(values.id, values);
      }
      return InsoleModelService.createInsoleModel(values as Omit<InsoleModel, 'id'>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insoleModels'] });
      message.success(`Model ${editingModel ? 'updated' : 'created'} successfully!`);
      closeModal();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to save model.');
    },
  });

  const { mutate: deleteModel } = useMutation({
    mutationFn: (id: number) => InsoleModelService.deleteInsoleModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insoleModels'] });
      message.success('Model deleted successfully!');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete model.');
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

  const handleValuesChange = (changedValues: any) => {
    if ('description' in changedValues) {
      setDescription(changedValues.description);
    } else {
      const newFilters = { ...filters, ...changedValues };
      for (const key in newFilters) {
        if (newFilters[key as keyof typeof newFilters] === undefined) {
          delete newFilters[key as keyof typeof newFilters];
        }
      }
      setFilters(newFilters);
    }
  };

  const columns = [
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Model Type', dataIndex: 'model_type', key: 'model_type', render: (type: string) => <Tag>{type}</Tag> },
    { title: 'Sell Value', dataIndex: 'sell_value', key: 'sell_value', render: (value: number) => `R$ ${value.toFixed(2)}` },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: InsoleModel) => (
        <Space size="middle">
          <Button onClick={() => showModal(record)}>Edit</Button>
          <Popconfirm title="Are you sure to delete this model?" onConfirm={() => deleteModel(record.id)} okText="Yes" cancelText="No">
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
        <Button type="primary" onClick={() => showModal()}>Add Model</Button>
      </div>

      <AntdForm
        form={antdFilterForm}
        layout="vertical"
        onValuesChange={handleValuesChange}
        style={{ marginBottom: 24, padding: 24, backgroundColor: '#fbfbfb', border: '1px solid #d9d9d9', borderRadius: 6 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <AntdForm.Item name="model_type" label="Filter by Type">
              <Select placeholder="Select a type" allowClear>
                <Option value="ALL">All Types</Option>
                {modelTypeOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
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
              <Input placeholder="Enter description" />
            </AntdForm.Item>
          </Col>
        </Row>
      </AntdForm>

      <Table dataSource={models} columns={columns} loading={isLoading} rowKey="id" />

      <Modal title={editingModel ? 'Edit Model' : 'Add Model'} open={isModalOpen} onCancel={closeModal} footer={null} destroyOnClose>
        <Form
          onSubmit={onSubmit}
          initialValues={editingModel || { active: true }}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="description" render={({ input }) => <AntdForm.Item label="Description" required><Input {...input} /></AntdForm.Item>} />
              <Field name="model_type" render={({ input }) => <AntdForm.Item label="Model Type" required><Select {...input} options={modelTypeOptions} /></AntdForm.Item>} />
              <Field name="sell_value" render={({ input }) => <AntdForm.Item label="Sell Value" required><InputNumber {...input} prefix="R$" style={{ width: '100%' }} /></AntdForm.Item>} />
              <Field name="eva_coating_id" render={({ input }) => <AntdForm.Item label="EVA Coating" required><Select {...input} options={evaCoatings?.map(c => ({ label: c.description, value: c.id }))} /></AntdForm.Item>} />
              <Field name="fabric_coating_id" render={({ input }) => <AntdForm.Item label="Fabric Coating" required><Select {...input} options={fabricCoatings?.map(c => ({ label: c.description, value: c.id }))} /></AntdForm.Item>} />
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

export default InsoleModelManagementPage;
