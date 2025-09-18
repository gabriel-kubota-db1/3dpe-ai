import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Card, Typography, Space, Tooltip, Form, Select, Input, Row, Col } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import { Prescription } from '@/@types/prescription';
import { useDebounce } from '@/hooks/useDebounce';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const prescriptionStatusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PRODUCTION', label: 'In Production' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELED', label: 'Canceled' },
];

const ListAdminPrescriptionsPage = () => {
  const [form] = Form.useForm();
  const [patientName, setPatientName] = useState('');
  const debouncedPatientName = useDebounce(patientName, 500);
  
  const [filters, setFilters] = useState<{ status?: string; patientName?: string }>({
    status: undefined,
    patientName: undefined,
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, patientName: debouncedPatientName || undefined }));
  }, [debouncedPatientName]);

  const { data: prescriptions, isLoading } = useQuery<Prescription[], Error>({
    queryKey: ['adminPrescriptions', filters],
    queryFn: () => PrescriptionService.getAdminPrescriptions(filters),
  });

  const handleValuesChange = (changedValues: any, allValues: any) => {
    if ('patientName' in changedValues) {
      setPatientName(changedValues.patientName);
    } else {
      setFilters(prev => ({ ...prev, ...changedValues }));
    }
  };

  const columns = [
    {
      title: 'Patient',
      dataIndex: ['patient', 'name'],
      key: 'patient',
    },
    {
      title: 'Insole Model',
      dataIndex: ['insoleModel', 'description'],
      key: 'insoleModel',
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
          <Tooltip title="View Details">
            <Link to={`/admin/prescriptions/details/${record.id}`}>
              <Button icon={<EyeOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title="Edit Prescription">
            <Link to={`/admin/prescriptions/edit/${record.id}`}>
              <Button icon={<EditOutlined />} />
            </Link>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}>Prescription Management</Title>
      
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="status" label="Filter by Status">
              <Select placeholder="Select a status" allowClear>
                <Option value="ALL">All Statuses</Option>
                {prescriptionStatusOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="patientName" label="Search by Patient Name">
              <Input placeholder="Enter patient name" />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        columns={columns}
        dataSource={prescriptions}
        loading={isLoading}
        rowKey="id"
      />
    </Card>
  );
};

export default ListAdminPrescriptionsPage;
