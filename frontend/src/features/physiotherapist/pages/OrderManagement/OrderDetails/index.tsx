import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Typography, Spin, Descriptions, Tag, Divider, Button, App, Row, Col, Input, Tooltip } from 'antd';
import { FaCreditCard, FaPix } from 'react-icons/fa6';
import { CopyOutlined } from '@ant-design/icons';
import QRCode from 'qrcode.react';
import * as OrderService from '@/http/OrderHttpService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColors: { [key: string]: string } = {
  PENDING_PAYMENT: 'gold',
  PROCESSING: 'blue',
  IN_PRODUCTION: 'purple',
  SHIPPED: 'cyan',
  COMPLETED: 'green',
  CANCELED: 'red',
};

const MockCreditCardForm = () => (
  <div>
    <Row gutter={[16, 16]}>
      <Col span={24}><Input placeholder="Card Number (e.g., 4242 4242 4242 4242)" /></Col>
      <Col span={24}><Input placeholder="Name on Card" /></Col>
      <Col span={12}><Input placeholder="Expiry (MM/YY)" /></Col>
      <Col span={12}><Input placeholder="CVV" /></Col>
    </Row>
  </div>
);

const MockPixPayment = ({ totalValue }: { totalValue: number }) => {
  const { message } = App.useApp();
  const pixCode = `00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Test Company6009SAO PAULO62070503***6304ABCD`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    message.success('PIX code copied to clipboard!');
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <Text>Scan the QR code or copy the code below to pay.</Text>
      <div style={{ margin: '24px 0' }}>
        <QRCode value={pixCode} size={180} />
      </div>
      <Input.Group compact>
        <Input style={{ width: 'calc(100% - 32px)' }} defaultValue={pixCode} readOnly />
        <Tooltip title="Copy PIX Code">
          <Button icon={<CopyOutlined />} onClick={handleCopy} />
        </Tooltip>
      </Input.Group>
    </div>
  );
};

const OrderDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['physioOrder', id],
    queryFn: () => OrderService.getPhysioOrder(Number(id)),
    enabled: !!id,
  });

  const { mutate: confirmPayment, isPending: isConfirmingPayment } = useMutation({
    mutationFn: () => OrderService.confirmPayment(Number(id)),
    onSuccess: () => {
      message.success('Payment confirmed successfully!');
      queryClient.invalidateQueries({ queryKey: ['physioOrder', id] });
      queryClient.invalidateQueries({ queryKey: ['physioOrders'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to confirm payment.');
    },
  });

  if (isLoading) return <Spin size="large" />;
  if (isError || !order) return <Title level={4}>Order not found.</Title>;

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={14}>
        <Card>
          <Title level={4}>Order Details (ID: {order.id})</Title>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Status">
              <Tag color={statusColors[order.status]}>{order.status.replace('_', ' ')}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Order Date">{dayjs(order.order_date).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
            <Descriptions.Item label="Subtotal">{`R$ ${order.order_value.toFixed(2)}`}</Descriptions.Item>
            <Descriptions.Item label="Shipping">{`R$ ${order.freight_value.toFixed(2)}`}</Descriptions.Item>
            <Descriptions.Item label="Total Value">
              <Text strong>{`R$ ${order.total_value.toFixed(2)}`}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">{order.payment_method}</Descriptions.Item>
          </Descriptions>
          <Divider />
          <Title level={5}>Prescriptions in this Order</Title>
          <Descriptions bordered column={1} size="small">
            {order.prescriptions?.map(p => (
              <Descriptions.Item key={p.id} label={`${p.patient?.name} - ${p.insoleModel?.description}`}>
                {`R$ ${p.insoleModel?.sell_value.toFixed(2)}`}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        {order.status === 'PENDING_PAYMENT' && (
          <Card>
            <Title level={4}>Complete Your Payment</Title>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 12 }}>
              {order.payment_method === 'Credit Card' ? <FaCreditCard size={24} /> : <FaPix size={24} />}
              <Title level={5} style={{ margin: 0 }}>Pay with {order.payment_method}</Title>
            </div>
            {order.payment_method === 'Credit Card' ? <MockCreditCardForm /> : <MockPixPayment totalValue={order.total_value} />}
            <Button
              type="primary"
              block
              style={{ marginTop: 24 }}
              onClick={() => confirmPayment()}
              loading={isConfirmingPayment}
            >
              Simulate Payment Confirmation
            </Button>
          </Card>
        )}
      </Col>
    </Row>
  );
};

export default OrderDetailsPage;
