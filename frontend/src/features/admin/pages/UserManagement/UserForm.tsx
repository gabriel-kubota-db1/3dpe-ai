import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Field } from 'react-final-form';
import { Input, Button, Switch, Select, App, Form as AntdForm, Typography, Card, Spin } from 'antd';
import * as UserService from '@/http/UserHttpService';
import { User } from '@/@types/user';

const { Title } = Typography;
const { Option } = Select;

const UserFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const [selectedRole, setSelectedRole] = useState<'physiotherapist' | 'industry' | null>(null);

  const { data: user, isLoading: isLoadingUser } = useQuery<User, Error>({
    queryKey: ['user', id],
    queryFn: () => UserService.getUser(Number(id)),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (isEditMode && user) {
      if (user.role === 'physiotherapist' || user.role === 'industry') {
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
    if (isEditMode) {
      updateUser(values);
    } else {
      createUser(values);
    }
  };

  if (isLoadingUser) {
    return <Spin tip="Loading user data..." />;
  }

  const initialValues = isEditMode ? user : { active: true, role: null };

  return (
    <Card>
      <Title level={3}>{isEditMode ? 'Edit User' : 'Create User'}</Title>
      <Form
        onSubmit={onSubmit}
        initialValues={initialValues}
        render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            {!isEditMode && (
              <Field name="role">
                {({ input }) => (
                  <AntdForm.Item label="User Role" required>
                    <Select {...input} onChange={(value) => { input.onChange(value); setSelectedRole(value); }}>
                      <Option value="physiotherapist">Physiotherapist</Option>
                      <Option value="industry">Industry</Option>
                    </Select>
                  </AntdForm.Item>
                )}
              </Field>
            )}

            <Field name="name">
              {({ input }) => <AntdForm.Item label="Name" required><Input {...input} /></AntdForm.Item>}
            </Field>
            <Field name="email">
              {({ input }) => <AntdForm.Item label="Email" required><Input {...input} type="email" /></AntdForm.Item>}
            </Field>
            <Field name="password_hash">
              {({ input }) => <AntdForm.Item label="Password" required><Input {...input} type="password" /></AntdForm.Item>}
            </Field>

            <Field name="document">
              {({ input }) => <AntdForm.Item label="Document (CPF/CNPJ)" required><Input {...input} /></AntdForm.Item>}
            </Field>

            <Field name="phone">
              {({ input }) => <AntdForm.Item label="Phone"><Input {...input} /></AntdForm.Item>}
            </Field>
            <Field name="active" type="checkbox">
              {({ input }) => <AntdForm.Item label="Active"><Switch {...input} checked={input.checked} /></AntdForm.Item>}
            </Field>

            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => navigate('/admin/users')} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                {isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>

          </form>
        )}
      />
    </Card>
  );
};

export default UserFormPage;
