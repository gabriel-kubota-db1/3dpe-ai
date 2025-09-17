import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Input, Card, Typography, Space, Select, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import * as PatientService from '@/http/PatientHttpService';
import { Patient } from '@/@types/patient';
import { formatCPF, formatDate, formatPhone } from '@/utils/formatter';
import { useDebounce } from '@/hooks/useDebounce';

const { Title } = Typography;
const { Search } = Input;

const ListPatientsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all'); // 'all', 'true', 'false'
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const queryParams = {
    search: debouncedSearchTerm,
    active: activeFilter === 'all' ? undefined : activeFilter,
  };

  const { data: patients, isLoading } = useQuery<Patient[], Error>({
    queryKey: ['patients', queryParams],
    queryFn: () => PatientService.getPatients(queryParams),
    keepPreviousData: true,
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
      render: (email?: string) => email || 'N/A',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone?: string) => formatPhone(phone),
    },
    {
      title: 'CPF',
      dataIndex: 'cpf',
      key: 'cpf',
      render: (cpf?: string) => formatCPF(cpf),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: boolean | React.Key, record: Patient) => record.active === value,
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
        <Title level={3} style={{ margin: 0 }}>My Patients</Title>
        <Link to="/physiotherapist/patients/new">
          <Button type="primary" icon={<PlusOutlined />}>
            New Patient
          </Button>
        </Link>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Search
          placeholder="Search by name, email, or CPF"
          style={{ width: 300 }}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
        <Space>
          <span>Status:</span>
          <Select
            defaultValue="all"
            style={{ width: 120 }}
            onChange={(value) => setActiveFilter(value)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
          />
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
