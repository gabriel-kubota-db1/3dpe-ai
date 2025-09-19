import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, Typography, Table, Tag, Spin, Alert } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpOutlined, UserOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import * as DashboardService from '@/http/DashboardHttpService';
import { DashboardMetrics } from '@/@types/dashboard';
import { Order } from '@/@types/order';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const statusColors: { [key: string]: string } = {
  PENDING_PAYMENT: 'gold',
  PROCESSING: 'blue',
  IN_PRODUCTION: 'purple',
  SHIPPED: 'cyan',
  COMPLETED: 'green',
  CANCELED: 'red',
};

const DashboardPage = () => {
  const { data, isLoading, isError, error } = useQuery<DashboardMetrics, Error>({
    queryKey: ['dashboardMetrics'],
    queryFn: DashboardService.getDashboardMetrics,
  });

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  if (isError) {
    return <Alert message="Error" description={error.message} type="error" showIcon />;
  }

  const recentOrdersColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Physiotherapist', dataIndex: ['physiotherapist', 'name'], key: 'physiotherapist' },
    { title: 'Date', dataIndex: 'order_date', key: 'order_date', render: (d: string) => dayjs(d).format('DD/MM/YYYY') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s.replace(/_/g, ' ')}</Tag> },
    { title: 'Total', dataIndex: 'total_value', key: 'total_value', render: (v: number) => `R$ ${v.toFixed(2)}` },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Order) => (
        <Link to={`/admin/orders/${record.id}`}>View Details</Link>
      ),
    },
  ];

  return (
    <div>
      <Title level={2} style={{ marginBottom: '24px' }}>Admin Dashboard</Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Revenue (Month)"
              value={data?.monthlyRevenue}
              precision={2}
              prefix="R$"
              valueStyle={{ color: '#3f8600' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="New Orders (Month)"
              value={data?.newOrdersCount}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total Patients"
              value={data?.totalPatients}
              valueStyle={{ color: '#cf1322' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Monthly Revenue (Last 12 Months)">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1B4B71" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1B4B71" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$${value}`} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Revenue']} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#1B4B71" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24}>
          <Card title="Recent Orders">
            <Table
              columns={recentOrdersColumns}
              dataSource={data?.recentOrders}
              rowKey="id"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
