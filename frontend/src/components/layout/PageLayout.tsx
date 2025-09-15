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

  const menuItems = [
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">My Profile</Link>,
    },
  ];

  if (user?.role === 'admin') {
    menuItems.push(
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
          defaultOpenKeys={['admin-management']}
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
