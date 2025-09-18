import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Typography, Tag, Button, Space } from 'antd';
import { Link } from 'react-router-dom';
import * as OrderService from '@/http/OrderHttpService';
import { Order } from '@/@types/order';
import dayjs from 'dayjs';
import { EditOrderStatusModal } from '../../../components/EditOrderStatusModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery<Order[], Error>({
    queryKey: ['physioOrders'],
    queryFn: OrderService.getPhysioOrders,
  });

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

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
      render: (status: string) => <Tag color={statusColors[status]}>{status.replace(/_/g, ' ')}</Tag>,
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space size="middle">
          <Link to={`/physiotherapist/orders/${record.id}`}>
            <Button type="link">Details</Button>
          </Link>
          <Button type="link" onClick={() => handleOpenModal(record)}>
            Edit Status
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Title level={3}>My Orders</Title>
        <Table
          columns={columns}
          dataSource={orders}
          loading={isLoading}
          rowKey="id"
        />
      </Card>
      {selectedOrder && (
        <EditOrderStatusModal
          order={selectedOrder}
          visible={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default ListOrdersPage;
