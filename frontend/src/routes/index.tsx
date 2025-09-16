import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spin } from 'antd';

import authRoutes from '@/features/auth/routes';
import commonRoutes from '@/features/common/routes';
import adminRoutes from '@/features/admin/routes';
import PrivateRoute from './PrivateRoute';

const AppRoutes = () => {
  const { isLoading, user, isInitialized, isAuthenticated } = useAuth();

  // Show loading during initial authentication check
  if (!isInitialized || isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f0f2f5'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes - available when not authenticated */}
      {authRoutes}
      
      {/* Protected routes - available when authenticated */}
      <Route element={<PrivateRoute />}>
        {commonRoutes}
      </Route>

      {/* Admin routes - available when authenticated as admin */}
      {user?.role === 'admin' && (
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          {adminRoutes}
        </Route>
      )}

      {/* Default redirects */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={isAuthenticated ? "/profile" : "/login"} 
            replace 
          />
        } 
      />
      <Route 
        path="*" 
        element={
          <Navigate 
            to={isAuthenticated ? "/profile" : "/login"} 
            replace 
          />
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
