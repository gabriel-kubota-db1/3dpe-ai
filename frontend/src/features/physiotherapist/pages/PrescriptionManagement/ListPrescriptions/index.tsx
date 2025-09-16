import { useQuery } from '@tanstack/react-query';
import { Table, Button, Card, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import dayjs from 'dayjs';

const { Title } = Typography;

const ListPrescriptionsPage = () => {
  const { data: prescriptions, isLoading } = useQuery<any[], Error>({
    queryKey: ['prescriptions'],
    queryFn: PrescriptionService.getPrescriptions,
  });

  const columns = [
    {
      title: 'Patient',
      dataIndex: 'patient',
      key: 'patient',
      render: (patient: any) => patient?.name || 'N/A',
    },
    {
      title: 'Insole Model',
      dataIndex: 'insoleModel',
      key: 'insoleModel',
      render: (model: any) => model?.name || 'N/A',
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Link to={`/physiotherapist/prescriptions/details/${record.id}`}>View</Link>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>Prescriptions</Title>
        <Link to="/physiotherapist/prescriptions/new">
          <Button type="primary" icon={<PlusOutlined />}>
            New Prescription
          </Button>
        </Link>
      </div>
      <Table
        columns={columns}
        dataSource={prescriptions}
        loading={isLoading}
        rowKey="id"
      />
    </Card>
  );
};

export default ListPrescriptionsPage;
