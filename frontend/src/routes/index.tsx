import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spin } from 'antd';

import authRoutes from '@/features/auth/routes';
import commonRoutes from '@/features/common/routes';
import adminRoutes from '@/features/admin/routes';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {authRoutes}
      
      {/* Common Routes for all authenticated users */}
      <Route element={<PrivateRoute />}>
        {commonRoutes}
      </Route>

      {/* Admin Routes */}
      {user?.role === 'admin' && (
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          {adminRoutes}
        </Route>
      )}

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
