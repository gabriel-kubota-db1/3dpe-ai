import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { Card, Typography, Spin, Steps, Button, App, Row, Col, Descriptions, Radio, Input, Divider } from 'antd';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import * as OrderService from '@/http/OrderHttpService';
import { Prescription } from '@/@types/prescription';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MaskedAntdInput } from '@/components/Form/MaskedAntdInput';

const { Title, Text } = Typography;

const cepMask = '00000-000';

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

  const { mutate: createOrder, isPending: isCreatingOrder } = useMutation({
    mutationFn: (values: any) => OrderService.createCheckout(values),
    onSuccess: () => {
      message.success('Order created successfully!');
      navigate('/physiotherapist/orders');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to create order.');
    },
  });

  const handleGetShipping = async (cep: string) => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      message.error('Please enter a valid CEP.');
      return;
    }
    setIsShippingLoading(true);
    try {
      const options = await OrderService.getShippingOptions({ cep, prescriptionIds });
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
      shipping: {
        ...selectedShipping,
        carrier: values.shipping.carrier,
      },
      payment: {
        method: 'Credit Card', // Mocked
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
        initialValues={{ cep: user?.cep || '' }}
        render={({ handleSubmit, values, form }) => (
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
                <Row gutter={16} align="bottom">
                  <Col>
                    <Field name="cep">
                      {({ input }) => (
                        <MaskedAntdInput {...input} mask={cepMask} unmask={true} placeholder="Enter CEP" />
                      )}
                    </Field>
                  </Col>
                  <Col>
                    <Button onClick={() => handleGetShipping(values.cep)} loading={isShippingLoading}>
                      Calculate Shipping
                    </Button>
                  </Col>
                </Row>
                {shippingOptions && (
                  <Field name="shipping.carrier">
                    {({ input }) => (
                      <Radio.Group {...input} style={{ marginTop: 16 }}>
                        {Object.values(shippingOptions).map((opt: any) => (
                          <Radio key={opt.carrier} value={opt.carrier}>
                            {`${opt.carrier} - R$ ${opt.price.toFixed(2)} (Up to ${opt.deadline} days)`}
                          </Radio>
                        ))}
                      </Radio.Group>
                    )}
                  </Field>
                )}
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <Title level={4}>Final Review</Title>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Subtotal">{`R$ ${orderValue.toFixed(2)}`}</Descriptions.Item>
                  <Descriptions.Item label="Shipping">{`R$ ${shippingOptions[values.shipping.carrier].price.toFixed(2)} (${values.shipping.carrier})`}</Descriptions.Item>
                  <Descriptions.Item label="Total">
                    <Text strong>{`R$ ${(orderValue + shippingOptions[values.shipping.carrier].price).toFixed(2)}`}</Text>
                  </Descriptions.Item>
                </Descriptions>
                <Divider />
                <Title level={4}>Payment</Title>
                <Card>
                  <Text>Payment gateway integration (e.g., AbacatePay iframe) would be here.</Text>
                  <br />
                  <Text strong>For now, click "Finalize Order" to simulate a successful payment.</Text>
                </Card>
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              {currentStep > 0 && <Button onClick={() => setCurrentStep(0)} style={{ marginRight: 8 }}>Back</Button>}
              {currentStep < 1 && <Button type="primary" onClick={() => setCurrentStep(1)} disabled={!values.shipping?.carrier}>Next</Button>}
              {currentStep === 1 && <Button type="primary" htmlType="submit" loading={isCreatingOrder}>Finalize Order</Button>}
            </div>
          </form>
        )}
      />
    </Card>
  );
};

export default CheckoutPage;
