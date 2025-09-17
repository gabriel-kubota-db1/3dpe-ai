import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Spin, Descriptions, Table, Tabs, Divider, Tag } from 'antd';
import * as PatientService from '@/http/PatientHttpService';
import { Patient, PatientAuditLog } from '@/@types/patient';
import dayjs from 'dayjs';
import { formatCEP, formatCPF, formatDate, formatPhone, formatRG } from '@/utils/formatter';

const { Title } = Typography;

const AuditLogTab = ({ patientId }: { patientId: number }) => {
    const { data: logs, isLoading } = useQuery<PatientAuditLog[], Error>({
        queryKey: ['patientAuditLogs', patientId],
        queryFn: () => PatientService.getPatientAuditLogs(patientId),
    });

    const columns = [
        { title: 'Action', dataIndex: 'action', key: 'action' },
        { title: 'Changed By', dataIndex: 'user', key: 'user', render: (user: { name: string }) => user?.name || 'System' },
        { title: 'Changed At', dataIndex: 'changed_at', key: 'changed_at', render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm') },
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
        <>
          <Title level={4}>Personal Information</Title>
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
            <Descriptions.Item label="Full Name">{patient.name}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={patient.active ? 'green' : 'red'}>
                {patient.active ? 'Active' : 'Inactive'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Email">{patient.email || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Phone">{formatPhone(patient.phone)}</Descriptions.Item>
            <Descriptions.Item label="Date of Birth">{formatDate(patient.date_of_birth)}</Descriptions.Item>
            <Descriptions.Item label="CPF">{formatCPF(patient.cpf)}</Descriptions.Item>
            <Descriptions.Item label="RG">{formatRG(patient.rg)}</Descriptions.Item>
            <Descriptions.Item label="Nationality">{patient.nationality || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Naturality">{patient.naturality || 'N/A'}</Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={4}>Address</Title>
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
            <Descriptions.Item label="CEP">{formatCEP(patient.cep)}</Descriptions.Item>
            <Descriptions.Item label="Street">{patient.street || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Number">{patient.number || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Complement">{patient.complement || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="City">{patient.city || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="State">{patient.state || 'N/A'}</Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={4}>Responsible Person</Title>
          <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
            <Descriptions.Item label="Name">{patient.responsible_name || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="CPF">{formatCPF(patient.responsible_cpf)}</Descriptions.Item>
            <Descriptions.Item label="Phone">{formatPhone(patient.responsible_phone)}</Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={4}>Medical Information</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Medical History"><pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{patient.medic_history || 'N/A'}</pre></Descriptions.Item>
            <Descriptions.Item label="Observations"><pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit' }}>{patient.observations || 'N/A'}</pre></Descriptions.Item>
          </Descriptions>
        </>
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
