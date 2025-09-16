import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spin } from 'antd';

const AuthGuard = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading while authentication is being verified
  if (!isInitialized || isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        backgroundColor: '#f0f2f5'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // If user is already authenticated, redirect to profile
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  // If not authenticated, show the auth pages (login, forgot password, etc.)
  return <Outlet />;
};

export default AuthGuard;
