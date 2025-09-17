import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, Select, Tag, Row, Col, InputNumber } from 'antd';
import { Form, Field } from 'react-final-form';
import { InsoleModel } from '@/@types/insoleModel';
import { Coating, CoatingType } from '@/@types/coating';
import * as InsoleModelService from '@/http/InsoleModelHttpService';
import * as CoatingService from '@/http/CoatingHttpService';

const { Title } = Typography;
const { Option } = Select;

const InsoleModelManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<InsoleModel | null>(null);
  const [selectedCoatingType, setSelectedCoatingType] = useState<CoatingType | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: insoleModels, isLoading } = useQuery<InsoleModel[], Error>({
    queryKey: ['insoleModels'],
    queryFn: InsoleModelService.getInsoleModels,
  });

  const { data: coatings, isLoading: isLoadingCoatings } = useQuery<Coating[], Error>({
    queryKey: ['coatings', selectedCoatingType],
    queryFn: () => CoatingService.getCoatings(selectedCoatingType!),
    enabled: !!selectedCoatingType,
  });

  useEffect(() => {
    if (editingModel && editingModel.coating) {
      setSelectedCoatingType(editingModel.coating.coating_type);
    } else {
      setSelectedCoatingType(null);
    }
  }, [editingModel]);

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
        width={800}
      >
        <Form
          onSubmit={onSubmit}
          initialValues={editingModel || undefined}
          render={({ handleSubmit, form }) => (
            <form onSubmit={handleSubmit}>
              <Row gutter={16}>
                <Col span={12}>
                  <Field name="description" render={({ input }) => <AntdForm.Item label="Description" required><Input {...input} /></AntdForm.Item>} />
                </Col>
                <Col span={12}>
                  <Field name="type">
                    {({ input }) => (
                      <AntdForm.Item label="Product Type" required>
                        <Select 
                          {...input} 
                          placeholder="Select product type"
                          value={input.value || undefined}
                        >
                          <Option value="INSOLE">INSOLE</Option>
                          <Option value="SLIPPER">SLIPPER</Option>
                          <Option value="ELEMENT">ELEMENT</Option>
                        </Select>
                      </AntdForm.Item>
                    )}
                  </Field>
                </Col>
                <Col span={12}>
                  <AntdForm.Item label="Coating Type" required>
                    <Select
                      value={selectedCoatingType}
                      onChange={(value) => {
                        setSelectedCoatingType(value);
                        form.change('coating_id', undefined);
                      }}
                      placeholder="Select coating type"
                    >
                      <Option value="EVA">EVA</Option>
                      <Option value="Fabric">Fabric</Option>
                    </Select>
                  </AntdForm.Item>
                </Col>
                <Col span={12}>
                  <Field name="coating_id">
                    {({ input }) => (
                      <AntdForm.Item label="Coating" required>
                        <Select
                          {...input}
                          placeholder="Select a coating"
                          loading={isLoadingCoatings}
                          disabled={!selectedCoatingType || isLoadingCoatings}
                          options={coatings?.map(c => ({ label: c.description, value: c.id }))}
                          allowClear
                        />
                      </AntdForm.Item>
                    )}
                  </Field>
                </Col>
                <Col span={12}>
                  <Field name="number_range" render={({ input }) => <AntdForm.Item label="Number Range" required><Input {...input} placeholder="e.g., 34-38" /></AntdForm.Item>} />
                </Col>
                <Col span={12}>
                  <Field name="weight" render={({ input }) => <AntdForm.Item label="Weight (grams)" required><InputNumber {...input} style={{ width: '100%' }} min={0} /></AntdForm.Item>} />
                </Col>
                <Col span={12}>
                  <Field name="cost_value" render={({ input }) => <AntdForm.Item label="Cost Value (R$)" required><InputNumber {...input} style={{ width: '100%' }} min={0} precision={2} /></AntdForm.Item>} />
                </Col>
                <Col span={12}>
                  <Field name="sell_value" render={({ input }) => <AntdForm.Item label="Sell Value (R$)" required><InputNumber {...input} style={{ width: '100%' }} min={0} precision={2} /></AntdForm.Item>} />
                </Col>
                <Col span={24}>
                  <Field name="active" type="checkbox">
                    {({ input }) => <AntdForm.Item label="Active"><Switch {...input} checked={input.checked} /></AntdForm.Item>}
                  </Field>
                </Col>
              </Row>
              <div style={{ textAlign: 'right', marginTop: '24px' }}>
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
