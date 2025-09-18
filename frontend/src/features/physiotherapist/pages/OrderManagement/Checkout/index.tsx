import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { Card, Typography, Spin, Steps, Button, App, Row, Col, Descriptions, Radio, Divider, Alert, Input } from 'antd';
import { FaCreditCard, FaPix } from 'react-icons/fa6';
import * as PrescriptionService from '@/http/PrescriptionHttpService';
import * as OrderService from '@/http/OrderHttpService';
import * as CouponService from '@/http/CouponHttpService';
import { Prescription } from '@/@types/prescription';
import { Coupon } from '@/@types/coupon';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { formatCEP } from '@/utils/formatter';
import api from '@/http/axios';

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
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');

  const { data: prescriptions, isLoading } = useQuery<Prescription[], Error>({
    queryKey: ['prescriptions', prescriptionIds],
    queryFn: () => Promise.all(prescriptionIds.map((id: number) => PrescriptionService.getPrescription(id))),
    enabled: prescriptionIds.length > 0,
  });

  // Fetch the current user profile to ensure we have the latest CEP information
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
    enabled: !!user?.id,
  });

  // Use userProfile if available, otherwise fallback to user from AuthContext
  const currentUser = userProfile || user;

  useEffect(() => {
    console.log('Debug - User from AuthContext:', user);
    console.log('Debug - User Profile from API:', userProfile);
    console.log('Debug - Current User (merged):', currentUser);
    console.log('Debug - Current User CEP:', currentUser?.cep);
    
    if (currentUser?.cep && prescriptionIds.length > 0) {
      handleGetShipping();
    }
  }, [currentUser?.cep, prescriptionIds]);

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

  const { mutate: validateCoupon, isPending: isApplyingCoupon } = useMutation<Coupon, Error, string>({
    mutationFn: (code: string) => CouponService.validateCoupon(code),
    onSuccess: (data) => {
      message.success(`Coupon "${data.code}" applied successfully!`);
      setAppliedCoupon(data);
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Failed to apply coupon.');
      setAppliedCoupon(null);
    },
  });

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      validateCoupon(couponCode.trim().toUpperCase());
    }
  };

  const handleGetShipping = async () => {
    if (!currentUser?.cep) {
      message.error('You must have a CEP registered in your profile to calculate shipping.');
      return;
    }
    setIsShippingLoading(true);
    try {
      const options = await OrderService.getShippingOptions({ cep: currentUser.cep, prescriptionIds });
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
      couponCode: appliedCoupon?.code,
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
        render={({ handleSubmit, values }) => {
          const shippingValue = values.shipping?.carrier ? shippingOptions[values.shipping.carrier].price : 0;
          const discountValue = appliedCoupon ? orderValue * (appliedCoupon.value / 100) : 0;
          const totalValue = orderValue + shippingValue - discountValue;

          return (
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
                  {!currentUser?.cep ? (
                    <Alert message="Please register a CEP in your profile to calculate shipping." type="warning" showIcon />
                  ) : (
                    <Row gutter={16} align="middle">
                      <Col><Text>Shipping to CEP: <strong>{formatCEP(currentUser.cep)}</strong></Text></Col>
                      <Col>
                        <Button 
                          size="small" 
                          onClick={handleGetShipping} 
                          loading={isShippingLoading}
                        >
                          Recalculate Shipping
                        </Button>
                      </Col>
                    </Row>
                  )}
                  {isShippingLoading && <Spin />}
                  {shippingOptions && (
                    <Field name="shipping.carrier" required>
                      {({ input }) => (
                        <Radio.Group {...input} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                  <Title level={4}>Discount Coupon</Title>
                  <Row gutter={8}>
                    <Col flex="auto">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={!!appliedCoupon}
                        size="large"
                      />
                    </Col>
                    <Col>
                      {appliedCoupon ? (
                        <Button size="large" onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode('');
                          message.info('Coupon removed.');
                        }}>
                          Remove
                        </Button>
                      ) : (
                        <Button size="large" type="primary" onClick={handleApplyCoupon} loading={isApplyingCoupon}>
                          Apply
                        </Button>
                      )}
                    </Col>
                  </Row>
                  {appliedCoupon && (
                    <Alert
                      message={`Discount of ${appliedCoupon.value}% applied.`}
                      type="success"
                      showIcon
                      style={{ marginTop: 16 }}
                    />
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
                    {appliedCoupon && (
                      <Descriptions.Item label={`Discount (${appliedCoupon.code})`}>
                        <Text type="success">{`- R$ ${discountValue.toFixed(2)}`}</Text>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Shipping">{`R$ ${shippingValue.toFixed(2)} (${shippingOptions[values.shipping.carrier].carrier})`}</Descriptions.Item>
                    <Descriptions.Item label="Payment Method">{values.paymentMethod}</Descriptions.Item>
                    <Descriptions.Item label="Total">
                      <Text strong>{`R$ ${totalValue.toFixed(2)}`}</Text>
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
          )
        }}
      />
    </Card>
  );
};

export default CheckoutPage;
