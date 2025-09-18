import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';

interface PrivateRouteProps {
  allowedRoles?: string[];
}

const PrivateRoute = ({ allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified and user doesn't have the required role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'physiotherapist':
        return <Navigate to="/physiotherapist" replace />;
      case 'industry':
        return <Navigate to="/industry" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
};

export default PrivateRoute;
