import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spin } from 'antd';

import authRoutes from '@/features/auth/routes';
import commonRoutes from '@/features/common/routes';
import adminRoutes from '@/features/admin/routes';
import physiotherapistRoutes from '@/features/physiotherapist/routes';
import industryRoutes from '@/features/industry/routes';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  const { isLoading, user, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes - public */}
      {authRoutes}
      
      {/* Root redirect */}
      <Route path="/" element={
        <Navigate to={
          !isAuthenticated ? "/login" :
          user?.role === 'admin' ? "/admin" :
          user?.role === 'physiotherapist' ? "/physiotherapist" :
          user?.role === 'industry' ? "/industry" :
          "/login"
        } replace />
      } />
      
      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        {/* Common Routes for all authenticated users */}
        {commonRoutes}
        
        {/* Admin Routes */}
        {user?.role === 'admin' && adminRoutes}
        
        {/* Physiotherapist Routes */}
        {user?.role === 'physiotherapist' && physiotherapistRoutes}
        
        {/* Industry Routes */}
        {user?.role === 'industry' && industryRoutes}
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
