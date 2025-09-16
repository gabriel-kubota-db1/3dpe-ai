import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { Input, Button, Switch, Select, App, Form as AntdForm, Typography, Card, Spin, Row, Col, Divider, DatePicker } from 'antd';
import * as UserService from '@/http/UserHttpService';
import { User } from '@/@types/user';
import dayjs from 'dayjs';
import { useCep } from '../../hooks/useCep';
import { MaskedAntdInput } from '@/components/Form/MaskedAntdInput';
import { useAuth } from '@/context/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const documentMask = [
  {
    mask: '000.000.000-00',
    maxLength: 11,
  },
  {
    mask: '00.000.000/0000-00',  
  },
];

const phoneMask = [
  {
    mask: '(00) 0000-0000',
    maxLength: 10,
  },
  {
    mask: '(00) 00000-0000',
  },
];

const cepMask = '00000-000';

// Form validation
const validate = (values: any) => {
  const errors: any = {};

  if (!values.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!values.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Invalid email format';
  }

  if (!values.document?.trim()) {
    errors.document = 'Document is required';
  }

  if (!values.role) {
    errors.role = 'Role is required';
  }

  // Password validation for new users
  if (!values.id && !values.password?.trim()) {
    errors.password = 'Password is required for new users';
  }

  return errors;
};

const UserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const { user: currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'physiotherapist' | 'industry' | null>(null);

  const { data: user, isLoading: isLoadingUser } = useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: () => UserService.getUser(Number(id)),
    enabled: isEditMode,
    staleTime: 0,
  });

  // Set role when user data is loaded
  useEffect(() => {
    if (isEditMode && user && (user.role === 'physiotherapist' || user.role === 'industry')) {
      setSelectedRole(user.role);
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
      submissionValues.date_of_birth = values.date_of_birth.startOf('day').format('YYYY-MM-DD');
    }

    if (isEditMode && (!submissionValues.password || submissionValues.password.trim() === '')) {
      delete submissionValues.password;
    }

    if (isEditMode) {
      updateUser(submissionValues);
    } else {
      createUser(submissionValues);
    }
  };

  // Loading state
  if (isEditMode && isLoadingUser) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" tip="Loading user data..." />
        </div>
      </Card>
    );
  }

  // Prepare initial values
  const getInitialValues = () => {
    if (isEditMode && user) {
      return {
        ...user,
        active: !!user.active,
        date_of_birth: user.date_of_birth ? dayjs(user.date_of_birth) : undefined,
        // Ensure string values for masked inputs
        document: user.document || '',
        phone: user.phone || '',
        cep: user.cep || '',
        state: user.state || '',
        city: user.city || '',
        street: user.street || '',
        number: user.number || '',
        complement: user.complement || '',
      };
    }
    
    return {
      active: true,
      role: null,
      document: '',
      phone: '',
      cep: '',
      state: '',
      city: '',
      street: '',
      number: '',
      complement: '',
    };
  };

  const initialValues = getInitialValues();

  return (
    <Card>
      <Title level={3}>{isEditMode ? 'Edit User' : 'Create User'}</Title>
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        validate={validate}
        render={({ handleSubmit, values, form }) => {
          const { fetchAddressByCep, isLoading: isCepLoading } = useCep(form);
          
          return (
            <form onSubmit={handleSubmit}>
              {!isEditMode && (
                <AntdForm.Item label="User Role" required>
                  <Field name="role">
                    {({ input }) => (
                      <Select 
                        {...input} 
                        onChange={(value) => { 
                          input.onChange(value); 
                          setSelectedRole(value); 
                        }}
                        placeholder="Select user role"
                      >
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
                      <Field name="name">
                        {({ input, meta }) => (
                          <AntdForm.Item 
                            label="Name" 
                            required 
                            validateStatus={meta.touched && meta.error ? 'error' : ''} 
                            help={meta.touched && meta.error}
                          >
                            <Input {...input} placeholder="Enter full name" />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Field name="email">
                        {({ input, meta }) => (
                          <AntdForm.Item 
                            label="Email" 
                            required 
                            validateStatus={meta.touched && meta.error ? 'error' : ''} 
                            help={meta.touched && meta.error}
                          >
                            <Input {...input} type="email" placeholder="Enter email address" />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Field name="document">
                        {({ input, meta }) => (
                          <AntdForm.Item 
                            label="Document (CPF/CNPJ)" 
                            required 
                            validateStatus={meta.touched && meta.error ? 'error' : ''} 
                            help={meta.touched && meta.error}
                          >
                            <MaskedAntdInput
                              {...input}
                              mask={documentMask}
                              unmask={true}
                              disabled={isEditMode && currentUser?.role !== 'admin'}
                              placeholder="Enter CPF or CNPJ"
                            />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Field name="password">
                        {({ input, meta }) => (
                          <AntdForm.Item
                            label="Password"
                            required={!isEditMode}
                            validateStatus={meta.touched && meta.error ? 'error' : ''}
                            help={isEditMode ? "Leave blank to keep current password" : (meta.touched && meta.error)}
                          >
                            <Input.Password 
                              {...input} 
                              placeholder={isEditMode ? "Enter new password" : "Required"} 
                            />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    {values.role === 'physiotherapist' && (
                      <Col xs={24} sm={12}>
                        <Field name="date_of_birth">
                          {({ input }) => (
                            <AntdForm.Item label="Date of Birth">
                              <DatePicker 
                                {...input} 
                                style={{ width: '100%' }} 
                                format="DD/MM/YYYY" 
                                placeholder="Select date of birth"
                              />
                            </AntdForm.Item>
                          )}
                        </Field>
                      </Col>
                    )}
                    <Col xs={24} sm={values.role === 'physiotherapist' ? 12 : 24}>
                      <Field name="phone">
                        {({ input }) => (
                          <AntdForm.Item label="Phone">
                            <MaskedAntdInput
                              {...input}
                              mask={phoneMask}
                              unmask={true}
                              placeholder="(XX) XXXXX-XXXX"
                            />
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
                            <MaskedAntdInput
                              {...input}
                              mask={cepMask}
                              unmask={true}
                              onBlur={() => {
                                if (input.value) {
                                  fetchAddressByCep(input.value);
                                }
                              }}
                              suffix={isCepLoading ? <Spin size="small" /> : null}
                              placeholder="00000-000"
                            />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col xs={24} sm={16}>
                      <Field name="street">
                        {({ input }) => (
                          <AntdForm.Item label="Street">
                            <Input {...input} placeholder="Street address" />
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
                            <Input {...input} placeholder="Number" />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col xs={24} sm={16}>
                      <Field name="complement">
                        {({ input }) => (
                          <AntdForm.Item label="Complement">
                            <Input {...input} placeholder="Apartment, suite, etc." />
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
                            <Input {...input} placeholder="City" />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Field name="state">
                        {({ input }) => (
                          <AntdForm.Item label="State">
                            <Input {...input} maxLength={2} placeholder="State (UF)" />
                          </AntdForm.Item>
                        )}
                      </Field>
                    </Col>
                  </Row>

                  <Divider />

                  <Field name="active" type="checkbox">
                    {({ input }) => (
                      <AntdForm.Item label="Active Status">
                        <Switch {...input} checked={input.checked} />
                      </AntdForm.Item>
                    )}
                  </Field>

                  <div style={{ textAlign: 'right', marginTop: 24 }}>
                    <Button 
                      onClick={() => navigate('/admin/users')} 
                      style={{ marginRight: 8 }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={isCreating || isUpdating}
                    >
                      {isEditMode ? 'Update User' : 'Create User'}
                    </Button>
                  </div>
                </>
              )}
            </form>
          );
        }}
      />
    </Card>
  );
};

export default UserFormPage;