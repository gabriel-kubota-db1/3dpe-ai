import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Switch, Input, Popconfirm, Space, App, Form as AntdForm, Typography, InputNumber, DatePicker } from 'antd';
import { Form, Field } from 'react-final-form';
import { Coupon } from '@/@types/coupon';
import * as CouponService from '@/http/CouponHttpService';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const { Title } = Typography;
const { RangePicker } = DatePicker;

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
      console.log('Mutation function received:', values);
      console.log('start_date type:', typeof values.start_date, values.start_date);
      console.log('finish_date type:', typeof values.finish_date, values.finish_date);
      
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
    
    // For RangePicker, ensure we get the correct date regardless of time/timezone
    // Send as ISO strings at start of day to match backend Joi validation
    const startDate = dayjs(date_range[0]).startOf('day');
    const endDate = dayjs(date_range[1]).startOf('day');
    
    const payload = {
      ...rest,
      start_date: startDate.toISOString(),
      finish_date: endDate.toISOString(),
    };
    
    createOrUpdateCoupon(editingCoupon ? { ...payload, id: editingCoupon.id } : payload);
  };

  const columns = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Value (%)', dataIndex: 'value', key: 'value', render: (value: string) => `${Number(value).toFixed(0)}%` },
    { title: 'Start Date', dataIndex: 'start_date', key: 'start_date', render: (date: string) => dayjs(date).format('DD/MM/YYYY') },
    { title: 'Finish Date', dataIndex: 'finish_date', key: 'finish_date', render: (date: string) => dayjs(date).format('DD/MM/YYYY') },
    { title: 'Active', dataIndex: 'active', key: 'active', render: (active: boolean) => <Switch checked={active} disabled /> },
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
    : { code: '', value: null, date_range: null, active: true };

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
                {({ input }) => <AntdForm.Item label="Validity Period" required><RangePicker {...input} style={{ width: '100%' }} format="DD/MM/YYYY" showTime={false} /></AntdForm.Item>}
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
