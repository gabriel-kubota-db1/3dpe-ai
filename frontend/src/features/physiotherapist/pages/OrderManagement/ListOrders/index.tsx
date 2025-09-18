import { useQuery } from '@tanstack/react-query';
import { Table, Card, Typography, Tag } from 'antd';
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

const ListOrdersPage = () => {
  const { data: orders, isLoading } = useQuery<Order[], Error>({
    queryKey: ['physioOrders'],
    queryFn: OrderService.getPhysioOrders,
  });

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={statusColors[status]}>{status.replace('_', ' ')}</Tag>,
    },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
      render: (value: number) => `R$ ${value.toFixed(2)}`,
    },
    {
      title: 'Prescriptions',
      dataIndex: 'prescriptions',
      key: 'prescriptions',
      render: (prescriptions: any[]) => prescriptions?.length || 0,
    },
  ];

  return (
    <Card>
      <Title level={3}>My Orders</Title>
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
