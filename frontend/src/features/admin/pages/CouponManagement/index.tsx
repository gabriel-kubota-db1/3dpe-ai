import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, Select, InputNumber, DatePicker, Tag } from 'antd';
import { Form, Field } from 'react-final-form';
import { Coupon } from '@/@types/coupon';
import * as CouponService from '@/http/CouponHttpService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const CouponManagementPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: coupons, isLoading } = useQuery<Coupon[], Error>({
    queryKey: ['coupons'],
    queryFn: CouponService.getCoupons,
  });

  const { mutate: createOrUpdateCoupon, isPending: isSaving } = useMutation({
    mutationFn: (values: Omit<Coupon, 'id'> | Coupon) => {
      const formattedValues = {
        ...values,
        expiry_date: dayjs(values.expiry_date).format('YYYY-MM-DD'),
      };
      if ('id' in formattedValues) {
        return CouponService.updateCoupon(formattedValues.id, formattedValues);
      }
      return CouponService.createCoupon(formattedValues);
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

  const onSubmit = (values: Omit<Coupon, 'id'>) => {
    createOrUpdateCoupon(editingCoupon ? { ...values, id: editingCoupon.id } : values);
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
    ? { ...editingCoupon, expiry_date: dayjs(editingCoupon.expiry_date) }
    : { code: '', discount_type: 'percentage', value: 0, expiry_date: null, active: true };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>Coupon Management</Title>
        <Button type="primary" onClick={() => showModal()}>
          Add Coupon
        </Button>
      </div>
      <Table dataSource={coupons} columns={columns} loading={isLoading} rowKey="id" />

      <Modal
        title={editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form
          onSubmit={onSubmit}
          initialValues={initialFormValues}
          render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Field name="code">
                {({ input }) => <AntdForm.Item label="Code"><Input {...input} /></AntdForm.Item>}
              </Field>
              <Field name="discount_type">
                {({ input }) => (
                  <AntdForm.Item label="Discount Type">
                    <Select {...input}>
                      <Option value="percentage">Percentage</Option>
                      <Option value="fixed">Fixed</Option>
                    </Select>
                  </AntdForm.Item>
                )}
              </Field>
              <Field name="value">
                {({ input }) => <AntdForm.Item label="Value"><InputNumber {...input} style={{ width: '100%' }} /></AntdForm.Item>}
              </Field>
              <Field name="expiry_date">
                {({ input }) => <AntdForm.Item label="Expiry Date"><DatePicker {...input} style={{ width: '100%' }} format="DD/MM/YYYY" /></AntdForm.Item>}
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
