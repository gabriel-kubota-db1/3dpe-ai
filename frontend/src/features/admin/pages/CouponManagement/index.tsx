import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, Select, Tag, Row, Col, InputNumber, DatePicker } from 'antd';
import { Form, Field } from 'react-final-form';
import { Coupon } from '@/@types/coupon';
import * as CouponService from '@/http/CouponHttpService';
import { useDebounce } from '@/hooks/useDebounce';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CouponManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const [antdFilterForm] = AntdForm.useForm();
  const [code, setCode] = useState('');
  const debouncedCode = useDebounce(code, 500);

  const [filters, setFilters] = useState<{
    active?: string;
    code?: string;
  }>({});

  useEffect(() => {
    setFilters(prev => ({ ...prev, code: debouncedCode || undefined }));
  }, [debouncedCode]);

  const { data: coupons, isLoading } = useQuery<Coupon[], Error>({
    queryKey: ['coupons', filters],
    queryFn: () => CouponService.getCoupons(filters),
  });

  const { mutate: createOrUpdateCoupon, isPending: isSaving } = useMutation({
    mutationFn: (values: Omit<Coupon, 'id'> | Coupon) => {
      const payload = {
        ...values,
        start_date: values.dates[0],
        finish_date: values.dates[1],
      };
      delete (payload as any).dates;

      if ('id' in payload && payload.id) {
        return CouponService.updateCoupon(payload.id, payload);
      }
      return CouponService.createCoupon(payload as Omit<Coupon, 'id'>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      message.success(`Coupon ${editingCoupon ? 'updated' : 'created'} successfully!`);
      closeModal();
    },
    onError: (error) => {
      message.error(error.message || 'Failed to save coupon.');
    },
  });

  const { mutate: deleteCoupon } = useMutation({
    mutationFn: (id: number) => CouponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      message.success('Coupon deleted successfully!');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete coupon.');
    },
  });

  const showModal = (coupon: Coupon | null = null) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCoupon(null);
    setIsModalOpen(false);
  };

  const onSubmit = (values: any) => {
    createOrUpdateCoupon(editingCoupon ? { ...values, id: editingCoupon.id } : values);
  };

  const handleValuesChange = (changedValues: any) => {
    if ('code' in changedValues) {
      setCode(changedValues.code);
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
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Value (%)', dataIndex: 'value', key: 'value' },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date', render: (date: string) => dayjs(date).format('DD/MM/YYYY') },
    { title: 'Finish Date', dataIndex: 'finish_date', key: 'finish_date', render: (date: string) => dayjs(date).format('DD/MM/YYYY') },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (active: boolean) => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Coupon) => (
        <Space size="middle">
          <Button onClick={() => showModal(record)}>Edit</Button>
          <Popconfirm title="Are you sure to delete this coupon?" onConfirm={() => deleteCoupon(record.id)} okText="Yes" cancelText="No">
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const initialFormValues = editingCoupon
    ? { ...editingCoupon, dates: [dayjs(editingCoupon.start_date), dayjs(editingCoupon.finish_date)] }
    : { active: true };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>Coupon Management</Title>
        <Button type="primary" onClick={() => showModal()}>Add Coupon</Button>
      </div>

      <AntdForm
        form={antdFilterForm}
        layout="vertical"
        onValuesChange={handleValuesChange}
        style={{ marginBottom: 24, padding: 24, backgroundColor: '#fbfbfb', border: '1px solid #d9d9d9', borderRadius: 6 }}
      >
        <Row gutter={16}>
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
            <AntdForm.Item name="code" label="Search by Code">
              <Input placeholder="Enter coupon code" />
            </AntdForm.Item>
          </Col>
        </Row>
      </AntdForm>

      <Table dataSource={coupons} columns={columns} loading={isLoading} rowKey="id" />

      <Modal title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'} open={isModalOpen} onCancel={closeModal} footer={null} destroyOnClose>
        <Form
          onSubmit={onSubmit}
          initialValues={initialFormValues}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="code" render={({ input }) => <AntdForm.Item label="Code" required><Input {...input} /></AntdForm.Item>} />
              <Field name="value" render={({ input }) => <AntdForm.Item label="Value (%)" required><InputNumber {...input} min={0} max={100} style={{ width: '100%' }} /></AntdForm.Item>} />
              <Field name="dates" render={({ input }) => <AntdForm.Item label="Validity Period" required><RangePicker {...input} style={{ width: '100%' }} format="YYYY-MM-DD" /></AntdForm.Item>} />
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

export default CouponManagementPage;
