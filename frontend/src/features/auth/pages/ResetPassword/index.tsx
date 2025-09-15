import { Form, Field } from 'react-final-form';
import { Input, Button, Typography, Card, Row, Col, App } from 'antd';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaLock } from 'react-icons/fa';
import api from '@/http/axios';

const { Title } = Typography;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const token = searchParams.get('token');

  const mutation = useMutation<any, Error, any>({
    mutationFn: (values) => api.post('/auth/reset-password', values),
    onSuccess: () => {
      message.success('Password has been reset successfully!');
      navigate('/login');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to reset password.';
      message.error(errorMessage);
    },
  });

  const onSubmit = (values: any) => {
    mutation.mutate({ ...values, token });
  };

  const validate = (values: any) => {
    const errors: any = {};
    if (!values.password) errors.password = 'New password is required';
    if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords must match';
    return errors;
  };

  if (!token) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col>
          <Card>
            <Title level={3} style={{ textAlign: 'center' }}>Invalid Reset Link</Title>
            <Typography.Text>The password reset link is missing or invalid.</Typography.Text>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Link to="/login">Go to Login</Link>
            </div>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2}>Reset Your Password</Title>
          </div>
          <Form
            onSubmit={onSubmit}
            validate={validate}
            render={({ handleSubmit, submitting }) => (
              <form onSubmit={handleSubmit}>
                <Field name="password">
                  {({ input, meta }) => (
                    <div style={{ marginBottom: '16px' }}>
                      <Input.Password {...input} placeholder="New Password" prefix={<FaLock />} />
                      {meta.touched && meta.error && <span style={{ color: 'red' }}>{meta.error}</span>}
                    </div>
                  )}
                </Field>
                <Field name="confirmPassword">
                  {({ input, meta }) => (
                    <div style={{ marginBottom: '16px' }}>
                      <Input.Password {...input} placeholder="Confirm New Password" prefix={<FaLock />} />
                      {meta.touched && meta.error && <span style={{ color: 'red' }}>{meta.error}</span>}
                    </div>
                  )}
                </Field>
                <Button type="primary" htmlType="submit" block loading={submitting || mutation.isPending}>
                  Reset Password
                </Button>
              </form>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ResetPasswordPage;
