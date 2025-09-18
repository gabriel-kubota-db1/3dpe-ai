import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Typography, Tag, Button, Space, Select, App, Form, Input, Row, Col } from 'antd';
import { DownloadOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import * as OrderService from '@/http/OrderHttpService';
import { Order } from '@/@types/order';
import EditOrderStatusModal from '../../../components/EditOrderStatusModal';
import { useDebounce } from '@/hooks/useDebounce';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const statusColors: { [key: string]: string } = {
  PENDING_PAYMENT: 'gold',
  PROCESSING: 'blue',
  IN_PRODUCTION: 'purple',
  SHIPPED: 'cyan',
  COMPLETED: 'green',
  CANCELED: 'red',
};

const statusOptions = [
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'IN_PRODUCTION', label: 'In Production' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELED', label: 'Canceled' },
];

const batchStatusOptions = statusOptions.filter(s => s.value !== 'PENDING_PAYMENT');

const ListOrdersPage = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [filters, setFilters] = useState<{ status?: string; search?: string }>({
    status: undefined,
    search: undefined,
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearchTerm || undefined }));
  }, [debouncedSearchTerm]);

  const { data: orders, isLoading } = useQuery<Order[], Error>({
    queryKey: ['adminOrders', filters],
    queryFn: () => OrderService.getIndustryOrders(filters),
  });

  const { mutate: batchUpdate } = useMutation({
    mutationFn: ({ orderIds, status }: { orderIds: number[], status: string }) => OrderService.batchUpdateStatusByAdmin(orderIds, status),
    onSuccess: () => {
      message.success('Orders updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setSelectedRowKeys([]);
    },
    onError: (error: any) => message.error(error.message || 'Failed to update orders.'),
  });

  const handleValuesChange = (changedValues: any) => {
    if ('search' in changedValues) {
      setSearchTerm(changedValues.search);
    } else {
      setFilters(prev => ({ ...prev, ...changedValues }));
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditModalVisible(true);
  };

  const handleCloseModal = () => {
    setEditModalVisible(false);
    setSelectedOrder(null);
  };

  const handleBatchUpdate = (status: string) => {
    batchUpdate({ orderIds: selectedRowKeys as number[], status });
  };

  const handleExport = async () => {
    try {
      const blob = await OrderService.exportOrdersToCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      message.error('Failed to export orders.');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Date', dataIndex: 'order_date', key: 'order_date', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Physiotherapist', dataIndex: ['physiotherapist', 'name'], key: 'physiotherapist' },
    { title: '# Prescriptions', dataIndex: 'prescriptions', key: 'prescriptions', render: (p: any[]) => p?.length || 0 },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s.replace(/_/g, ' ')}</Tag> },
    { title: 'Total', dataIndex: 'total_value', key: 'total_value', render: (v: number) => `R$ ${v.toFixed(2)}` },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space>
          <Link to={`/admin/orders/${record.id}`}>
            <Button type="primary" icon={<EyeOutlined />}>Details</Button>
          </Link>
          <Button type="default" icon={<EditOutlined />} onClick={() => handleEditOrder(record)}>Edit Status</Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>Order Management</Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>Export CSV</Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" onValuesChange={handleValuesChange} style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={3}>
            <Form.Item name="status">
              <Select placeholder="Select a status" allowClear>
                <Option value="ALL">All Statuses</Option>
                {statusOptions.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={21}>
            <Form.Item name="search">
              <Input placeholder="Search by Order ID or Physiotherapist" style={{ width: '100%' }}/>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, background: '#e6f7ff', padding: '8px 16px', border: '1px solid #91d5ff', borderRadius: 4 }}>
          <Space>
            <Typography.Text strong>{`${selectedRowKeys.length} items selected`}</Typography.Text>
            <Select placeholder="Batch Action" style={{ width: 180 }} onChange={handleBatchUpdate} options={batchStatusOptions} />
          </Space>
        </div>
      )}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={orders}
        loading={isLoading}
        rowKey="id"
      />
      
      {selectedOrder && (
        <EditOrderStatusModal
          order={selectedOrder}
          visible={editModalVisible}
          onClose={handleCloseModal}
        />
      )}
    </Card>
  );
};

export default ListOrdersPage;
