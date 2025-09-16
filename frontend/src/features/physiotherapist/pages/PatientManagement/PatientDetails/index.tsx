import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Spin, Descriptions, Table, Tabs } from 'antd';
import * as PatientService from '@/http/PatientHttpService';
import { Patient, PatientAuditLog } from '@/@types/patient';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AuditLogTab = ({ patientId }: { patientId: number }) => {
    const { data: logs, isLoading } = useQuery<PatientAuditLog[], Error>({
        queryKey: ['patientAuditLogs', patientId],
        queryFn: () => PatientService.getPatientAuditLogs(patientId),
    });

    const columns = [
        { title: 'Action', dataIndex: 'action', key: 'action' },
        { title: 'Changed At', dataIndex: 'changed_at', key: 'changed_at', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
        { title: 'User ID', dataIndex: 'user_id', key: 'user_id' },
        // Add more columns to show diff between old_data and new_data if needed
    ];

    return <Table columns={columns} dataSource={logs} loading={isLoading} rowKey="id" />;
};

const PatientDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: patient, isLoading } = useQuery<Patient, Error>({
    queryKey: ['patient', id],
    queryFn: () => PatientService.getPatient(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <Spin tip="Loading patient details..." />;
  }

  if (!patient) {
    return <Title level={3}>Patient not found</Title>;
  }

  const items = [
    {
      key: '1',
      label: 'Patient Details',
      children: (
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Name">{patient.name}</Descriptions.Item>
          <Descriptions.Item label="Email">{patient.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{patient.phone}</Descriptions.Item>
          <Descriptions.Item label="CPF">{patient.cpf}</Descriptions.Item>
          {/* Add all other fields */}
        </Descriptions>
      ),
    },
    {
      key: '2',
      label: 'Audit Log',
      children: <AuditLogTab patientId={patient.id} />,
    },
  ];

  return (
    <Card>
      <Title level={3}>{patient.name}</Title>
      <Tabs defaultActiveKey="1" items={items} />
    </Card>
  );
};

export default PatientDetailsPage;
