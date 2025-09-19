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
  ShoppingCartOutlined,
  BuildOutlined,
  DashboardOutlined,
  BarChartOutlined,
  BookOutlined,
  PlayCircleOutlined,
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
          {
            key: 'physio-orders-submenu', // FIX: Using a unique key for the submenu
            icon: <ShoppingCartOutlined />,
            label: 'Orders',
            children: [
              {
                key: '/physiotherapist/orders/new',
                label: <Link to="/physiotherapist/orders/new">New Order</Link>,
              },
              {
                key: '/physiotherapist/orders',
                label: <Link to="/physiotherapist/orders">My Orders</Link>,
              },
            ]
          },
        ],
      },
      { type: 'divider' },
      {
        key: 'education',
        icon: <BookOutlined />,
        label: 'Education',
        children: [
          {
            key: '/physiotherapist/courses',
            icon: <PlayCircleOutlined />,
            label: <Link to="/physiotherapist/courses">My Courses</Link>,
          },
        ],
      }
    );
  }

  if (user?.role === 'industry') {
    menuItems.push(
      { type: 'divider' },
      {
        key: 'industry-management',
        icon: <BuildOutlined />,
        label: 'Industry Portal',
        children: [
          {
            key: '/industry/orders',
            icon: <ShoppingCartOutlined />,
            label: <Link to="/industry/orders">Order Management</Link>,
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
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/admin/dashboard">Dashboard</Link>,
          },
          {
            key: '/admin/production-report',
            icon: <BarChartOutlined />,
            label: <Link to="/admin/production-report">Production Report</Link>,
          },
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
          {
            key: '/admin/orders',
            icon: <ShoppingCartOutlined />,
            label: <Link to="/admin/orders">Orders</Link>,
          },
        ],
      },
      { type: 'divider' },
      {
        key: 'ead-management',
        icon: <BookOutlined />,
        label: 'Education',
        children: [
          {
            key: '/admin/ead/courses',
            icon: <PlayCircleOutlined />,
            label: <Link to="/admin/ead/courses">Courses</Link>,
          },
          {
            key: '/admin/ead/categories',
            icon: <TagOutlined />,
            label: <Link to="/admin/ead/categories">Categories</Link>,
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
          defaultOpenKeys={['admin-management', 'physiotherapist-management', 'industry-management', 'education', 'ead-management']}
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
