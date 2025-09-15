import { Form, Field } from 'react-final-form';
import { Input, Button, Typography, Card, Row, Col, App, Spin, DatePicker, Form as AntdForm } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/http/axios';
import { User } from '@/@types/user';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import axios from 'axios';

const { Title } = Typography;

const fetchProfile = async (): Promise<User> => {
  const { data } = await api.get('/users/profile');
  return data;
};

const UserProfilePage = () => {
  const { user, logout } = useAuth();
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, isError } = useQuery<User, Error>({
    queryKey: ['profile', user?.id],
    queryFn: fetchProfile,
    enabled: !!user,
  });

  const mutation = useMutation<User, Error, Partial<User>>({
    mutationFn: (updatedProfile) => api.put('/users/profile', updatedProfile),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', user?.id], data);
      message.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to update profile.';
      message.error(errorMessage);
    },
  });

  const onSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      date_of_birth: values.date_of_birth ? dayjs(values.date_of_birth).format('YYYY-MM-DD') : null,
    };
    mutation.mutate(formattedValues);
  };

  const handleCepBlur = async (cep: string, form: any) => {
    const cleanedCep = cep?.replace(/\D/g, '');
    if (cleanedCep?.length !== 8) return;

    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      if (!data.erro) {
        form.change('state', data.uf);
        form.change('city', data.localidade);
        form.change('street', data.logradouro);
      } else {
        message.error('CEP not found.');
      }
    } catch (error) {
      message.error('Failed to fetch address from CEP.');
    }
  };

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
  if (isError) return <div>Error loading profile.</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card>
            <Title level={3}>My Profile</Title>
            <Form
              onSubmit={onSubmit}
              initialValues={{
                ...profile,
                date_of_birth: profile?.date_of_birth ? dayjs(profile.date_of_birth) : null,
              }}
              render={({ handleSubmit, form, submitting, pristine }) => (
                <form onSubmit={handleSubmit}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Field name="name">
                        {({ input }) => (
                          <AntdForm.Item label="Name">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col span={12}>
                      <Field name="cpf">
                        {({ input }) => (
                          <AntdForm.Item label="CPF">
                            <Input {...input} disabled />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col span={12}>
                      <Field name="email">
                        {({ input }) => (
                          <AntdForm.Item label="Email">
                            <Input {...input} type="email" />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col span={12}>
                      <Field name="phone">
                        {({ input }) => (
                          <AntdForm.Item label="Phone">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col span={12}>
                      <Field name="date_of_birth">
                        {({ input }) => (
                          <AntdForm.Item label="Date of Birth">
                            <DatePicker {...input} style={{ width: '100%' }} format="DD/MM/YYYY" />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col span={12}>
                      <Field name="cep">
                        {({ input }) => (
                          <AntdForm.Item label="CEP">
                            <Input {...input} onBlur={() => handleCepBlur(input.value, form)} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col span={8}>
                      <Field name="state">
                        {({ input }) => (
                          <AntdForm.Item label="State">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col span={16}>
                      <Field name="city">
                        {({ input }) => (
                          <AntdForm.Item label="City">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col span={16}>
                      <Field name="street">
                        {({ input }) => (
                          <AntdForm.Item label="Street">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col span={8}>
                      <Field name="number">
                        {({ input }) => (
                          <AntdForm.Item label="Number">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col span={24}>
                      <Field name="complement">
                        {({ input }) => (
                          <AntdForm.Item label="Complement">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>
                  <Row justify="end" gutter={8}>
                    <Col>
                      <Button onClick={logout}>Logout</Button>
                    </Col>
                    <Col>
                      <Button type="primary" htmlType="submit" disabled={submitting || pristine} loading={mutation.isPending}>
                        Save Changes
                      </Button>
                    </Col>
                  </Row>
                </form>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfilePage;
