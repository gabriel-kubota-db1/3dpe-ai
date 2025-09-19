import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, InputNumber, DatePicker, Tag, Row, Col, Select } from 'antd';
import { Form, Field } from 'react-final-form';
import { Coupon } from '@/@types/coupon';
import * as CouponService from '@/http/CouponHttpService';
import dayjs from 'dayjs';
import { useDebounce } from '@/hooks/useDebounce';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CouponManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const [codeFilter, setCodeFilter] = useState('');
  const debouncedCode = useDebounce(codeFilter, 500);

  const [filters, setFilters] = useState<{
    active?: string;
    code?: string;
  }>({ code: '' });

  useEffect(() => {
    setFilters((prevFilters) => ({ ...prevFilters, code: debouncedCode }));
  }, [debouncedCode]);

  const { data: coupons, isLoading } = useQuery<Coupon[], Error>({
    queryKey: ['coupons', filters],
    queryFn: () => CouponService.getCoupons(filters),
  });

  const { mutate: createOrUpdateCoupon, isPending: isSaving } = useMutation({
    mutationFn: (values: Omit<Coupon, 'id'> | Coupon) => {
      if ('id' in values) {
        return CouponService.updateCoupon(values.id, values);
      }
      return CouponService.createCoupon(values);
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
    const { date_range, ...rest } = values;
    const payload = {
      ...rest,
      start_date: dayjs(date_range[0]).format('YYYY-MM-DD'),
      finish_date: dayjs(date_range[1]).format('YYYY-MM-DD'),
    };
    createOrUpdateCoupon(editingCoupon ? { ...payload, id: editingCoupon.id } : payload);
  };

  const handleFilterChange = (changedValues: any, allValues: any) => {
    if ('code' in changedValues) {
      setCodeFilter(changedValues.code);
    } else {
      setFilters(allValues);
    }
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Value (%)', dataIndex: 'value', key: 'value', render: (value: string) => `${Number(value).toFixed(0)}%` },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date', render: (date: string) => dayjs(date).format('DD/MM/YYYY') },
    { title: 'Finish Date', dataIndex: 'finish_date', key: 'finish_date', render: (date: string) => dayjs(date).format('DD/MM/YYYY') },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),},
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Coupon) => (
        <Space size="middle">
          <Button onClick={() => showModal(record)}>Edit</Button>
          <Popconfirm
            title="Delete the coupon"
            description="Are you sure to delete this coupon?"
            onConfirm={() => deleteCoupon(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const initialFormValues = editingCoupon
    ? { ...editingCoupon, date_range: [dayjs(editingCoupon.start_date), dayjs(editingCoupon.finish_date)] }
    : { code: '', value: undefined, date_range: [], active: true };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>Coupon Management</Title>
        <Button type="primary" onClick={() => showModal()}>
          Add Coupon
        </Button>
      </div>

      <AntdForm
        layout="vertical"
        onValuesChange={handleFilterChange}
        style={{ marginBottom: 24, padding: 24, backgroundColor: '#fbfbfb', border: '1px solid #d9d9d9', borderRadius: 6 }}
      >
        <Row gutter={16}>
          <Col span={16}>
            <AntdForm.Item name="code" label="Search by Code">
              <Input placeholder="Enter coupon code" allowClear />
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
        </Row>
      </AntdForm>

      <Table dataSource={coupons} columns={columns} loading={isLoading} rowKey="id" />

      <Modal
        title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
        key={editingCoupon?.id || 'new'}
      >
        <Form
          onSubmit={onSubmit}
          initialValues={initialFormValues}
          key={editingCoupon?.id || 'new'}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="code" >
                {({ input }) => <AntdForm.Item label="Code" required><Input {...input} /></AntdForm.Item>}
              </Field>
              <Field name="value">
                {({ input }) => <AntdForm.Item label="Value (%)" required><InputNumber {...input} min={0} max={100} addonAfter="%" style={{ width: '100%' }} /></AntdForm.Item>}
              </Field>
              <Field name="date_range">
                {({ input }) => <AntdForm.Item label="Validity Period" required><RangePicker {...input} style={{ width: '100%' }} format="DD/MM/YYYY" /></AntdForm.Item>}
              </Field>
              <Field name="active" type="checkbox">
                {({ input }) => <AntdForm.Item label="Active"><Switch {...input} checked={input.checked} /></AntdForm.Item>}
              </Field>
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

export default CouponManagementPage;
