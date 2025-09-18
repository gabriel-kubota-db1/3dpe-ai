import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Typography, Tag, Select, App } from 'antd';
import * as OrderService from '@/http/OrderHttpService';
import { Order } from '@/@types/order';
import dayjs from 'dayjs';

const { Title } = Typography;

const statusColors: { [key: string]: string } = {
  PENDING_PAYMENT: 'gold',
  PROCESSING: 'blue',
  IN_PRODUCTION: 'purple',
  SHIPPED: 'cyan',
  COMPLETED: 'green',
  CANCELED: 'red',
};

const statusOptions = [
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'IN_PRODUCTION', label: 'In Production' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELED', label: 'Canceled' },
];

const ListOrdersPage = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: orders, isLoading } = useQuery<Order[], Error>({
    queryKey: ['industryOrders'],
    queryFn: OrderService.getIndustryOrders,
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => OrderService.updateOrderStatusByIndustry(id, status),
    onSuccess: () => {
      message.success('Order status updated!');
      queryClient.invalidateQueries({ queryKey: ['industryOrders'] });
    },
    onError: (error: any) => message.error(error.message || 'Failed to update status.'),
  });

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Date', dataIndex: 'order_date', key: 'order_date', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Physiotherapist', dataIndex: ['physiotherapist', 'name'], key: 'physiotherapist' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Order) => (
        <Select
          defaultValue={status}
          style={{ width: 150 }}
          onChange={(newStatus) => updateStatus({ id: record.id, status: newStatus })}
          options={statusOptions}
        >
        </Select>
      ),
    },
    { title: 'Total', dataIndex: 'total_value', key: 'total_value', render: (v: number) => `R$ ${v.toFixed(2)}` },
  ];

  return (
    <Card>
      <Title level={3}>Order Management</Title>
      <Table
        columns={columns}
        dataSource={orders}
        loading={isLoading}
        rowKey="id"
      />
    </Card>
  );
};

export default ListOrdersPage;
