import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Form, Select, Button, App } from 'antd';
import * as OrderService from '@/http/OrderHttpService';
import { Order } from '@/@types/order';

interface EditOrderStatusModalProps {
  order: Order;
  visible: boolean;
  onClose: () => void;
}

const ORDER_STATUSES: Order['status'][] = [
  'PENDING_PAYMENT',
  'PROCESSING',
  'IN_PRODUCTION',
  'SHIPPED',
  'COMPLETED',
  'CANCELED',
];

export const EditOrderStatusModal = ({ order, visible, onClose }: EditOrderStatusModalProps) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      OrderService.updateOrderStatusByIndustry(id, status),
    onSuccess: () => {
      message.success('Order status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['industryOrders'] });
      onClose();
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to update order status.');
    },
  });

  const handleFinish = (values: { status: Order['status'] }) => {
    updateStatus({ id: order.id, status: values.status });
  };

  return (
    <Modal
      title={`Edit Status for Order #${order.id}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={isPending} onClick={() => form.submit()}>
          Save
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ status: order.status }}
      >
        <Form.Item
          name="status"
          label="Order Status"
          rules={[{ required: true, message: 'Please select a status!' }]}
        >
          <Select placeholder="Select a new status">
            {ORDER_STATUSES.map((status) => (
              <Select.Option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditOrderStatusModal;
