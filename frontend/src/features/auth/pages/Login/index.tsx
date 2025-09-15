import { Form, Field } from 'react-final-form';
import { Input, Button, Typography, Card, Row, Col, App } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaUser, FaLock } from 'react-icons/fa';
import api from '@/http/axios';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/@types/user';

const { Title } = Typography;

interface LoginResponse {
  data: {
    token: string;
    user: User;
  }
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { message } = App.useApp();

  const mutation = useMutation<LoginResponse, Error, any>({
    mutationFn: (values) => api.post('/auth/login', values),
    onSuccess: (data) => {
      login(data.data.token, data.data.user);
      message.success('Login successful!');
      navigate('/profile');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      message.error(errorMessage);
    },
  });

  const onSubmit = (values: any) => {
    mutation.mutate(values);
  };

  const validate = (values: any) => {
    const errors: any = {};
    if (!values.email) errors.email = 'Email is required';
    if (!values.password) errors.password = 'Password is required';
    return errors;
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Col xs={22} sm={16} md={12} lg={8} xl={6}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Title level={2}>3DPé</Title>
            <Typography.Text>Welcome back! Please login to your account.</Typography.Text>
          </div>
          <Form
            onSubmit={onSubmit}
            validate={validate}
            render={({ handleSubmit, submitting }) => (
              <form onSubmit={handleSubmit}>
                <Field name="email">
                  {({ input, meta }) => (
                    <div style={{ marginBottom: '16px' }}>
                      <Input {...input} type="email" placeholder="Email" prefix={<FaUser />} />
                      {meta.touched && meta.error && <span style={{ color: 'red' }}>{meta.error}</span>}
                    </div>
                  )}
                </Field>
                <Field name="password">
                  {({ input, meta }) => (
                    <div style={{ marginBottom: '16px' }}>
                      <Input.Password {...input} placeholder="Password" prefix={<FaLock />} />
                      {meta.touched && meta.error && <span style={{ color: 'red' }}>{meta.error}</span>}
                    </div>
                  )}
                </Field>
                <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                  <Link to="/forgot-password">Forgot Password?</Link>
                </div>
                <Button type="primary" htmlType="submit" block loading={submitting || mutation.isPending}>
                  Login
                </Button>
              </form>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default LoginPage;
