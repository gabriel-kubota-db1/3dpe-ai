import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Switch, Popconfirm, Space, App, Typography, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { UserListItem } from '@/@types/user';
import * as UserService from '@/http/UserHttpService';
import { FaEdit, FaTrash } from 'react-icons/fa';

const { Title } = Typography;

const roleColors: { [key: string]: string } = {
  admin: 'red',
  physiotherapist: 'blue',
  industry: 'purple',
  patient: 'green',
};

const UserListPage = () => {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const { data: users, isLoading } = useQuery<UserListItem[], Error>({
    queryKey: ['users'],
    queryFn: UserService.getUsers,
  });

  const { mutate: deleteUser } = useMutation({
    mutationFn: (id: number) => UserService.deleteUser(id),
    onSuccess: (_, deletedUserId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', deletedUserId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', deletedUserId] });
      message.success('User deleted successfully!');
    },
    onError: (error) => {
      message.error(error.message || 'Failed to delete user.');
    },
  });

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={roleColors[role]}>{role.toUpperCase()}</Tag>,
    },
    {
      title: 'Active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: UserListItem) => (
        <Space size="middle">
          <Link to={`/admin/users/edit/${record.id}`}>
            <Button icon={<FaEdit />} />
          </Link>
          <Popconfirm
            title="Delete the user"
            description="Are you sure to delete this user?"
            onConfirm={() => deleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<FaTrash />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={3}>User Management</Title>
        <Link to="/admin/users/new">
          <Button type="primary">Add User</Button>
        </Link>
      </div>
      <Table dataSource={users} columns={columns} loading={isLoading} rowKey="id" />
    </div>
  );
};

export default UserListPage;
