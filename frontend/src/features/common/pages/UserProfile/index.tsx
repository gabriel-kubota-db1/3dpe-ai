import { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { Input, Button, Typography, Row, Col, App, Spin, DatePicker, Form as AntdForm, Divider } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/http/axios';
import { User } from '@/@types/user';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import axios from 'axios';
import { MaskedAntdInput } from '@/components/Form/MaskedAntdInput';

const { Title, Paragraph } = Typography;

const fetchProfile = async (): Promise<User> => {
  const { data } = await api.get('/users/profile');
  return data;
};

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
  },
  {
    mask: '(00) 00000-0000',
  },
];

const cepMask = {
  mask: '00000-000',
};

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [formKey, setFormKey] = useState(0);

  const { data: profile, isLoading, isError, refetch } = useQuery<User, Error>({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
    enabled: !!user?.id,
    staleTime: 0, // Always fetch fresh data
    initialData: user || undefined, // Use user from AuthContext as initial data
  });

  const mutation = useMutation<User, Error, Partial<User>>({
    mutationFn: async (updatedProfile) => {
      const response = await api.put('/users/profile', updatedProfile);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile'], data);
      updateUser(data);
      message.success('Profile updated successfully!');
      setFormKey(prev => prev + 1); // Force form re-render with new data
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

  // Use user from AuthContext as fallback and update React Query cache
  useEffect(() => {
    if (user && !profile) {
      queryClient.setQueryData(['user-profile'], user);
    }
  }, [user, profile, queryClient]);

  // Force re-fetch when component mounts
  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  // Use profile data if available, otherwise fallback to user from AuthContext
  const currentUserData = profile || user;

  // Update form key when user data changes to force re-render
  useEffect(() => {
    setFormKey(prev => prev + 1);
  }, [currentUserData?.document, currentUserData?.phone, currentUserData?.cep, currentUserData?.id]);

  if (isLoading && !currentUserData) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  if (isError && !currentUserData) {
    return <div style={{ textAlign: 'center', marginTop: 50 }}>Error loading profile.</div>;
  }

  if (!currentUserData) {
    return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  }

  // Prepare initial values with proper handling of all fields
  const initialValues = {
    name: currentUserData.name || '',
    email: currentUserData.email || '',
    document: currentUserData.document || '',
    phone: currentUserData.phone || '',
    cep: currentUserData.cep || '',
    state: currentUserData.state || '',
    city: currentUserData.city || '',
    street: currentUserData.street || '',
    number: currentUserData.number || '',
    complement: currentUserData.complement || '',
    date_of_birth: currentUserData.date_of_birth ? dayjs(currentUserData.date_of_birth) : null,
  };

  return (
    <div style={{ padding: '24px', background: '#fff', minHeight: '100%' }}>
      <Form
        key={formKey} // Force re-render when profile updates
        onSubmit={onSubmit}
        initialValues={initialValues}
        render={({ handleSubmit, form, submitting, pristine }) => (
          <form onSubmit={handleSubmit} style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <Title level={2}>My Profile</Title>
            <Paragraph>Update your personal information and address details below.</Paragraph>
            
            <Divider orientation="left">Personal Information</Divider>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Field name="name">
                  {({ input }) => (
                    <AntdForm.Item label="Full Name">
                      <Input {...input} size="large" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field name="document">
                  {({ input }) => (
                    <AntdForm.Item label="Document (CPF/CNPJ)">
                      <MaskedAntdInput 
                        {...input} 
                        mask={documentMask} 
                        unmask={true} 
                        size="large" 
                        disabled 
                        style={{ width: '100%' }}
                      />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field name="email">
                  {({ input }) => (
                    <AntdForm.Item label="Email Address">
                      <Input {...input} type="email" size="large" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field name="phone">
                  {({ input }) => (
                    <AntdForm.Item label="Phone Number">
                      <MaskedAntdInput 
                        {...input} 
                        mask={phoneMask} 
                        unmask={true} 
                        size="large" 
                        placeholder="(XX) XXXXX-XXXX" 
                        style={{ width: '100%' }}
                      />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field name="date_of_birth">
                  {({ input }) => (
                    <AntdForm.Item label="Date of Birth">
                      <DatePicker {...input} style={{ width: '100%' }} format="DD/MM/YYYY" size="large" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
            </Row>

            <Divider orientation="left">Address</Divider>
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Field name="cep">
                  {({ input }) => (
                    <AntdForm.Item label="CEP">
                      <MaskedAntdInput
                        {...input}
                        mask={cepMask.mask}
                        unmask
                        size="large"
                        onBlur={() => handleCepBlur(input.value, form)}
                      />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} md={16}>
                <Field name="street">
                  {({ input }) => (
                    <AntdForm.Item label="Street">
                      <Input {...input} size="large" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} md={8}>
                <Field name="number">
                  {({ input }) => (
                    <AntdForm.Item label="Number">
                      <Input {...input} size="large" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} md={16}>
                <Field name="complement">
                  {({ input }) => (
                    <AntdForm.Item label="Complement">
                      <Input {...input} size="large" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field name="city">
                  {({ input }) => (
                    <AntdForm.Item label="City">
                      <Input {...input} size="large" />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
              <Col xs={24} md={12}>
                <Field name="state">
                  {({ input }) => (
                    <AntdForm.Item label="State">
                      <Input {...input} size="large" maxLength={2} />
                    </AntdForm.Item>
                  )}
                </Field>
              </Col>
            </Row>

            <Row justify="end" style={{ marginTop: '24px' }}>
              <Col>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  disabled={submitting || pristine} 
                  loading={mutation.isPending} 
                  size="large"
                >
                  Save Changes
                </Button>
              </Col>
            </Row>
          </form>
        )}
      />
    </div>
  );
};

export default UserProfilePage;