import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  TagOutlined,
  BookOutlined,
  ReadOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';

export const adminMenuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  {
    key: 'user-management',
    icon: <UserOutlined />,
    label: 'User Management',
    children: [
      { key: '/admin/users/physiotherapists', label: 'Physiotherapists' },
      { key: '/admin/users/industries', label: 'Industries' },
      { key: '/admin/users/admins', label: 'Administrators' },
    ],
  },
  { key: '/admin/patients', icon: <ApartmentOutlined />, label: 'Patients' },
  { key: '/admin/prescriptions', icon: <FileTextOutlined />, label: 'Prescriptions' },
  { key: '/admin/orders', icon: <ShoppingOutlined />, label: 'Orders' },
  { key: '/admin/insole-models', icon: <ReadOutlined />, label: 'Insole Models' },
  { key: '/admin/coupons', icon: <TagOutlined />, label: 'Coupons' },
  {
    key: 'education',
    icon: <BookOutlined />,
    label: 'Education',
    children: [
      { key: '/admin/ead/courses', label: 'Courses' },
      { key: '/admin/ead/categories', label: 'Categories' },
    ],
  },
];
