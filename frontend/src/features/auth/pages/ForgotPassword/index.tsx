import { Form, Field } from 'react-final-form';
import { Input, Button, Typography, Card, Row, Col, App } from 'antd';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaEnvelope } from 'react-icons/fa';
import api from '@/http/axios';

const { Title } = Typography;

const ForgotPasswordPage = () => {
  const { message } = App.useApp();

  const mutation = useMutation<any, Error, { email: string }>({
    mutationFn: (values) => api.post('/auth/forgot-password', values),
    onSuccess: (data) => {
      message.info(data.data.message);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'An error occurred.';
      message.error(errorMessage);
    },
  });

  const onSubmit = (values: { email: string }) => {
    mutation.mutate(values);
  };

  const validate = (values: { email?: string }) => {
    const errors: { email?: string } = {};
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }
    return errors;
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2}>Forgot Password</Title>
            <Typography.Text>Enter your email to receive a reset link.</Typography.Text>
          </div>
          <Form
            onSubmit={onSubmit}
            validate={validate}
            render={({ handleSubmit, submitting }) => (
              <form onSubmit={handleSubmit}>
                <Field name="email">
                  {({ input, meta }) => (
                    <div style={{ marginBottom: '16px' }}>
                      <Input {...input} type="email" placeholder="Email" prefix={<FaEnvelope />} />
                      {meta.touched && meta.error && <span style={{ color: 'red' }}>{meta.error}</span>}
                    </div>
                  )}
                </Field>
                <Button type="primary" htmlType="submit" block loading={submitting || mutation.isPending}>
                  Send Reset Link
                </Button>
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Link to="/login">Back to Login</Link>
                </div>
              </form>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ForgotPasswordPage;
