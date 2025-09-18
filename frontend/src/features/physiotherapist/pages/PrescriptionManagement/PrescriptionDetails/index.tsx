import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Spin, Typography, Button, Tabs, Descriptions, Row, Col, App } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import { Prescription } from '@/@types/prescription';
import dayjs from 'dayjs';
import { PalmilhogramaConfigurator } from '../../../components/PalmilhogramaConfigurator';

const { Title } = Typography;
const { TabPane } = Tabs;

const PrescriptionDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data: prescription, isLoading, isError, error } = useQuery<Prescription, Error>({
    queryKey: ['prescription', id],
    queryFn: () => PrescriptionService.getPrescription(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin tip="Loading prescription..." /></div>;
  }

  if (isError) {
    message.error(error?.message || 'Failed to load prescription details.');
    navigate('/physiotherapist/prescriptions');
    return null;
  }

  if (!prescription) {
    return <Title level={4}>Prescription not found.</Title>;
  }

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/physiotherapist/prescriptions')}>
            Back to Prescriptions
          </Button>
        </Col>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Prescription Details
          </Title>
        </Col>
        <Col>
          <Link to={`/physiotherapist/prescriptions/edit/${id}`}>
            <Button type="primary" icon={<EditOutlined />}>
              Edit Prescription
            </Button>
          </Link>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Prescription Info" key="1">
          <Descriptions bordered column={1} labelStyle={{ fontWeight: 'bold' }}>
            <Descriptions.Item label="Patient">{prescription.patient?.name}</Descriptions.Item>
            <Descriptions.Item label="Insole Model">{prescription.insoleModel?.description}</Descriptions.Item>
            <Descriptions.Item label="Numeration (Shoe Size)">{prescription.numeration}</Descriptions.Item>
            <Descriptions.Item label="Status">{prescription.status}</Descriptions.Item>
            <Descriptions.Item label="Creation Date">{dayjs(prescription.created_at).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="Observations">{prescription.observations || 'N/A'}</Descriptions.Item>
          </Descriptions>
        </TabPane>
        <TabPane tab="Palmilhograma" key="2">
          <PalmilhogramaConfigurator 
            data={prescription.palmilogram || {}} 
            onChange={() => {}} 
            readOnly 
            showTitle={false}
          />
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default PrescriptionDetailsPage;
