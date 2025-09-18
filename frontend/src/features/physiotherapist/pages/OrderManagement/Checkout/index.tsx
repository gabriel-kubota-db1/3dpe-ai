import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { Card, Typography, Spin, Steps, Button, App, Row, Col, Descriptions, Radio, Divider, Alert } from 'antd';
import { FaCreditCard, FaPix } from 'react-icons/fa6';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import * as OrderService from '@/http/OrderHttpService';
import { Prescription } from '@/@types/prescription';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatCEP } from '@/utils/formatter';

const { Title, Text } = Typography;

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { user } = useAuth();
  const { prescriptionIds } = location.state || { prescriptionIds: [] };

  const [currentStep, setCurrentStep] = useState(0);
  const [shippingOptions, setShippingOptions] = useState<any>(null);
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  const { data: prescriptions, isLoading } = useQuery<Prescription[], Error>({
    queryKey: ['prescriptions', prescriptionIds],
    queryFn: () => Promise.all(prescriptionIds.map((id: number) => PrescriptionService.getPrescription(id))),
    enabled: prescriptionIds.length > 0,
  });

  useEffect(() => {
    if (user?.cep) {
      handleGetShipping();
    }
  }, [user?.cep, prescriptionIds]);

  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation({
    mutationFn: (values: any) => OrderService.createCheckout(values),
    onSuccess: (data) => {
      message.success('Order created successfully! Please proceed with the payment.');
      navigate(`/physiotherapist/orders/${data.id}`);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create order.');
    },
  });

  const handleGetShipping = async () => {
    if (!user?.cep) {
      message.error('You must have a CEP registered in your profile to calculate shipping.');
      return;
    }
    setIsShippingLoading(true);
    try {
      const options = await OrderService.getShippingOptions({ cep: user.cep, prescriptionIds });
      setShippingOptions(options);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to get shipping options.');
    } finally {
      setIsShippingLoading(false);
    }
  };

  const onSubmit = (values: any) => {
    const selectedShipping = shippingOptions[values.shipping.carrier];
    const payload = {
      prescriptionIds,
      shipping: selectedShipping,
      payment: {
        method: values.paymentMethod,
      },
      observations: values.observations,
    };
    createOrder(payload);
  };

  if (isLoading) return <Spin />;
  if (!prescriptions || prescriptions.length === 0) {
    return <Title level={4}>No prescriptions selected.</Title>;
  }

  const orderValue = prescriptions.reduce((sum, p) => sum + (p.insoleModel?.sell_value || 0), 0);

  return (
    <Card>
      <Title level={3}>Checkout</Title>
      <Steps current={currentStep} style={{ margin: '24px 0' }}>
        <Steps.Step title="Review & Shipping" />
        <Steps.Step title="Payment & Confirmation" />
      </Steps>

      <Form
        onSubmit={onSubmit}
        initialValues={{ paymentMethod: 'Credit Card' }}
        render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            {currentStep === 0 && (
              <div>
                <Title level={4}>Order Summary</Title>
                <Descriptions bordered column={1}>
                  {prescriptions.map(p => (
                    <Descriptions.Item key={p.id} label={`${p.patient?.name} - ${p.insoleModel?.description}`}>
                      {`R$ ${p.insoleModel?.sell_value.toFixed(2)}`}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
                <Divider />
                <Title level={4}>Shipping</Title>
                {!user?.cep ? (
                  <Alert message="Please register a CEP in your profile to calculate shipping." type="warning" showIcon />
                ) : (
                  <Row gutter={16} align="middle">
                    <Col><Text>Shipping to CEP: <strong>{formatCEP(user.cep)}</strong></Text></Col>
                  </Row>
                )}
                {shippingOptions && (
                  <Field name="shipping.carrier" required>
                    {({ input }) => (
                      <Radio.Group {...input} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8   }}>
                        {Object.entries(shippingOptions).map(([key, opt]: [string, any]) => (
                          <Radio key={key} value={key}>
                            {`${opt.company} (${opt.carrier}) - R$ ${opt.price.toFixed(2)} (Up to ${opt.deadline} days)`}
                          </Radio>
                        ))}
                      </Radio.Group>
                    )}
                  </Field>
                )}
                <Divider />
                <Title level={4}>Payment Method</Title>
                <Field name="paymentMethod" required>
                  {({ input }) => (
                    <Radio.Group {...input}>
                      <Radio.Button value="Credit Card"><FaCreditCard style={{ marginRight: 8 }} />Credit Card</Radio.Button>
                      <Radio.Button value="PIX"><FaPix style={{ marginRight: 8 }} />PIX</Radio.Button>
                    </Radio.Group>
                  )}
                </Field>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <Title level={4}>Final Review</Title>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Subtotal">{`R$ ${orderValue.toFixed(2)}`}</Descriptions.Item>
                  <Descriptions.Item label="Shipping">{`R$ ${shippingOptions[values.shipping.carrier].price.toFixed(2)} (${shippingOptions[values.shipping.carrier].carrier})`}</Descriptions.Item>
                  <Descriptions.Item label="Payment Method">{values.paymentMethod}</Descriptions.Item>
                  <Descriptions.Item label="Total">
                    <Text strong>{`R$ ${(orderValue + shippingOptions[values.shipping.carrier].price).toFixed(2)}`}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              {currentStep > 0 && <Button onClick={() => setCurrentStep(0)} style={{ marginRight: 8 }}>Back</Button>}
              {currentStep < 1 && <Button type="primary" onClick={() => setCurrentStep(1)} disabled={!values.shipping?.carrier || !values.paymentMethod}>Next</Button>}
              {currentStep === 1 && <Button type="primary" htmlType="submit" loading={isCreatingOrder}>Create Order & Proceed to Payment</Button>}
            </div>
          </form>
        )}
      />
    </Card>
  );
};

export default CheckoutPage;
