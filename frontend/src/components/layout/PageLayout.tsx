import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  SettingOutlined,
  TagOutlined,
  AppstoreOutlined,
  GiftOutlined,
  LogoutOutlined,
  TeamOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';

const { Sider, Content, Header } = Layout;

const AppHeader = () => {
  const { logout } = useAuth();
  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', background: '#fff' }}>
      <h1 style={{ color: '#1B4B71', margin: 0 }}>3DPé Admin</h1>
      <Menu mode="horizontal" selectable={false}>
        <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
          Logout
        </Menu.Item>
      </Menu>
    </Header>
  );
};


const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems: any[] = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">My Profile</Link>,
    },
  ];

  if (user?.role === 'physiotherapist') {
    menuItems.push(
      { type: 'divider' },
      {
        key: 'physiotherapist-management',
        icon: <SettingOutlined />,
        label: 'Management',
        children: [
          {
            key: '/physiotherapist/patients',
            icon: <TeamOutlined />,
            label: <Link to="/physiotherapist/patients">Patients</Link>,
          },
          {
            key: '/physiotherapist/prescriptions',
            icon: <FileTextOutlined />,
            label: <Link to="/physiotherapist/prescriptions">Prescriptions</Link>,
          },
        ],
      }
    );
  }

  if (user?.role === 'industry') {
    menuItems.push(
      { type: 'divider' },
      {
        key: 'industry-info',
        icon: <AppstoreOutlined />,
        label: 'Industry Portal',
        children: [
          {
            key: '/coming-soon',
            icon: <TagOutlined />,
            label: 'Coming Soon',
            disabled: true,
          },
        ],
      }
    );
  }

  if (user?.role === 'admin') {
    menuItems.push(
      { type: 'divider' },
      {
        key: 'admin-management',
        icon: <SettingOutlined />,
        label: 'Management',
        children: [
          {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: <Link to="/admin/users">Users</Link>,
          },
          {
            key: '/admin/coatings',
            icon: <AppstoreOutlined />,
            label: <Link to="/admin/coatings">Coatings</Link>,
          },
          {
            key: '/admin/insole-models',
            icon: <TagOutlined />,
            label: <Link to="/admin/insole-models">Insole Models</Link>,
          },
          {
            key: '/admin/coupons',
            icon: <GiftOutlined />,
            label: <Link to="/admin/coupons">Coupons</Link>,
          },
        ],
      }
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light">
        <div style={{ height: '64px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ color: '#1B4B71', margin: 0 }}>3DPé</h2>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['admin-management', 'physiotherapist-management', 'industry-info']}
          style={{ height: '100%', borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <AppHeader />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default PageLayout;
