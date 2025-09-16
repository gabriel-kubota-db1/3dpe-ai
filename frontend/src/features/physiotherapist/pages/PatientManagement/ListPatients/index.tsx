import { useQuery } from '@tanstack/react-query';
import { Table, Button, Input, Card, Typography, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import * as PatientService from '@/http/PatientHttpService';
import { Patient } from '@/@types/patient';

const { Title } = Typography;
const { Search } = Input;

const ListPatientsPage = () => {
  const { data: patients, isLoading } = useQuery<Patient[], Error>({
    queryKey: ['patients'],
    queryFn: PatientService.getPatients,
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Patient, b: Patient) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Patient) => (
        <Space size="middle">
          <Link to={`/physiotherapist/patients/edit/${record.id}`}>Edit</Link>
          <Link to={`/physiotherapist/patients/details/${record.id}`}>Details</Link>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3}>My Patients</Title>
        <Space>
          <Search placeholder="Search patients" style={{ width: 300 }} />
          <Link to="/physiotherapist/patients/new">
            <Button type="primary" icon={<PlusOutlined />}>
              New Patient
            </Button>
          </Link>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={patients}
        loading={isLoading}
        rowKey="id"
      />
    </Card>
  );
};

export default ListPatientsPage;
