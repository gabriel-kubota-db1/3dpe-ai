import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { Input, Button, Switch, Select, App, Form as AntdForm, Typography, Card, Spin, Row, Col, Divider, DatePicker } from 'antd';
import * as UserService from '@/http/UserHttpService';
import { User } from '@/@types/user';
import dayjs from 'dayjs';
import { useCep } from '../../hooks/useCep';

const { Title } = Typography;
const { Option } = Select;

const UserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [selectedRole, setSelectedRole] = useState<'physiotherapist' | 'industry' | 'patient' | null>(null);

  const { data: user, isLoading: isLoadingUser } = useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: () => UserService.getUser(Number(id)),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && user) {
      if (user.role === 'physiotherapist' || user.role === 'industry' || user.role === 'patient') {
        setSelectedRole(user.role);
      }
    }
  }, [user, isEditMode]);

  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: (values: Partial<User>) => UserService.updateUser(Number(id), values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      message.success('User updated successfully!');
      navigate('/admin/users');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to update user.');
    },
  });

  const { mutate: createUser, isPending: isCreating } = useMutation({
    mutationFn: (values: any) => {
      if (values.role === 'physiotherapist') {
        return UserService.registerPhysiotherapist(values);
      }
      if (values.role === 'industry') {
        return UserService.registerIndustry(values);
      }
      if (values.role === 'patient') {
        return UserService.registerPatient(values);
      }
      throw new Error('Invalid role for creation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('User created successfully!');
      navigate('/admin/users');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to create user.');
    },
  });

  const onSubmit = (values: any) => {
    const submissionValues = { ...values };
    if (values.date_of_birth && dayjs.isDayjs(values.date_of_birth)) {
      submissionValues.date_of_birth = values.date_of_birth.format('YYYY-MM-DD');
    }

    if (isEditMode) {
      updateUser(submissionValues);
    } else {
      createUser(submissionValues);
    }
  };

  if (isLoadingUser) {
    return <Spin tip="Loading user data..." />;
  }

  const initialValues = isEditMode && user 
    ? { ...user, date_of_birth: user.date_of_birth ? dayjs(user.date_of_birth) : undefined } 
    : { active: true, role: null };

  return (
    <Card>
      <Title level={3}>{isEditMode ? 'Edit User' : 'Create User'}</Title>
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        render={({ handleSubmit, values, form }) => {
          const { fetchAddressByCep, isLoading: isCepLoading } = useCep(form);
          return (
            <form onSubmit={handleSubmit}>
              {!isEditMode && (
                <AntdForm.Item label="User Role" required>
                  <Field name="role">
                    {({ input }) => (
                      <Select {...input} onChange={(value) => { input.onChange(value); setSelectedRole(value); }}>
                        <Option value="patient">Patient</Option>
                        <Option value="physiotherapist">Physiotherapist</Option>
                        <Option value="industry">Industry</Option>
                      </Select>
                    )}
                  </Field>
                </AntdForm.Item>
              )}

              {(selectedRole || values.role || isEditMode) && (
                <>
                  <Title level={4} style={{ marginTop: 24 }}>Personal Information</Title>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Field name="name" >
                        {({ input, meta }) => (
                          <AntdForm.Item label="Name" required validateStatus={meta.touched && meta.error ? 'error' : ''} help={meta.touched && meta.error}>
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Field name="email">
                        {({ input, meta }) => (
                          <AntdForm.Item label="Email" required validateStatus={meta.touched && meta.error ? 'error' : ''} help={meta.touched && meta.error}>
                            <Input {...input} type="email" />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Field name="document">
                        {({ input, meta }) => (
                          <AntdForm.Item label="Document (CPF/CNPJ)" required validateStatus={meta.touched && meta.error ? 'error' : ''} help={meta.touched && meta.error}>
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Field name="date_of_birth">
                        {({ input }) => (
                          <AntdForm.Item label="Date of Birth">
                            <DatePicker {...input} style={{ width: '100%' }} format="DD/MM/YYYY" />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Field name="phone">
                        {({ input }) => (
                          <AntdForm.Item label="Phone">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>

                  <Divider />

                  <Title level={4}>Address</Title>
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Field name="cep">
                        {({ input }) => (
                          <AntdForm.Item label="CEP">
                            <Input 
                              {...input} 
                              onBlur={() => fetchAddressByCep(input.value)}
                              suffix={isCepLoading ? <Spin size="small" /> : null}
                            />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col xs={24} sm={16}>
                      <Field name="street">
                        {({ input }) => (
                          <AntdForm.Item label="Street">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Field name="number">
                        {({ input }) => (
                          <AntdForm.Item label="Number">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col xs={24} sm={16}>
                      <Field name="complement">
                        {({ input }) => (
                          <AntdForm.Item label="Complement">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Field name="city">
                        {({ input }) => (
                          <AntdForm.Item label="City">
                            <Input {...input} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Field name="state">
                        {({ input }) => (
                          <AntdForm.Item label="State">
                            <Input {...input} maxLength={2} />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>

                  <Divider />

                  <Field name="active" type="checkbox">
                    {({ input }) => <AntdForm.Item label="Active"><Switch {...input} checked={input.checked} /></AntdForm.Item>}
                  </Field>

                  <div style={{ textAlign: 'right', marginTop: 24 }}>
                    <Button onClick={() => navigate('/admin/users')} style={{ marginRight: 8 }}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                      {isEditMode ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          )
        }}
      />
    </Card>
  );
};

export default UserFormPage;
