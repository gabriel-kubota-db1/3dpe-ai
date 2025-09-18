import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Typography, Spin, Button, Row, Col, Divider, Tag, Descriptions, Empty } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import * as OrderService from '@/http/OrderHttpService';
import { Order } from '@/@types/order';
import { Prescription } from '@/@types/prescription';
import { PalmilhogramaConfigurator } from '@/features/physiotherapist/components/PalmilhogramaConfigurator';
import dayjs from 'dayjs';
import './print.css';
import { formatCPF } from '@/utils/formatter';

const { Title, Text } = Typography;

const statusColors: { [key: string]: string } = {
  PENDING_PAYMENT: 'gold',
  PROCESSING: 'blue',
  IN_PRODUCTION: 'purple',
  SHIPPED: 'cyan',
  COMPLETED: 'green',
  CANCELED: 'red',
};

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading, isError } = useQuery<Order, Error>({
    queryKey: ['adminOrderDetails', id],
    queryFn: () => OrderService.getAdminOrderDetails(Number(id)),
    enabled: !!id,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <Spin size="large" style={{ display: 'block', marginTop: 50 }} />;
  }

  if (isError || !order) {
    return <Empty description="Order not found or failed to load." />;
  }

  return (
    <div>
      <Row justify="space-between" align="middle" className="no-print">
        <Title level={3}>Order Details #{order.id}</Title>
        <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
          Print Order
        </Button>
      </Row>
      <div id="printable-area">
        <div className="print-page">
          <Card style={{ marginTop: 24 }} className="page-container">
            <div className="order-details-section">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Title level={4}>Order #{order.id}</Title>
                  <Tag color={statusColors[order.status]}>{order.status.replace(/_/g, ' ')}</Tag>
                </Col>
              </Row>
              <Divider />
              <Row gutter={[32, 32]}>
                <Col xs={24} md={12}>
                  <Title level={5}>Physiotherapist Details</Title>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Name">{order.physiotherapist?.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{order.physiotherapist?.email}</Descriptions.Item>
                    <Descriptions.Item label="Document">{formatCPF(order.physiotherapist?.document)}</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} md={12}>
                  <Title level={5}>Order Summary</Title>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Order Date">{dayjs(order.order_date).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                    <Descriptions.Item label="Order Value">R$ {order.order_value.toFixed(2)}</Descriptions.Item>
                    {order.discount_value > 0 && (
                      <Descriptions.Item label="Discount">
                        <Text style={{ color: '#52c41a' }}>-R$ {order.discount_value.toFixed(2)}</Text>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Freight Value">R$ {order.freight_value.toFixed(2)}</Descriptions.Item>
                    <Descriptions.Item label="Total Value"><strong>R$ {order.total_value.toFixed(2)}</strong></Descriptions.Item>
                    <Descriptions.Item label="Payment Method">{order.payment_method?.replace(/_/g, ' ')}</Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </div>
          </Card>
        </div>
        
        <Title level={4} style={{ marginTop: 24 }} className="no-print">Prescriptions</Title>
        
        {order.prescriptions?.map((prescription: Prescription) => (
          <div className="print-page prescription-section" key={prescription.id}>
            <Card type="inner" title={`Prescription for ${prescription.patient?.name}`} style={{ marginTop: 16 }} className="page-container">
              <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
                <Descriptions.Item label="Insole Model">{prescription.insoleModel?.description}</Descriptions.Item>
                <Descriptions.Item label="Model Price">R$ {prescription.insoleModel?.sell_value.toFixed(2)}</Descriptions.Item>
                <Descriptions.Item label="Numeration">{prescription.numeration}</Descriptions.Item>
                {prescription.observations && (
                  <Descriptions.Item label="Observations">{prescription.observations}</Descriptions.Item>
                )}
              </Descriptions>
              <div className="palmilogram-container">
                <PalmilhogramaConfigurator data={prescription.palmilogram || {}} onChange={() => {}} readOnly showTitle={false} />
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
