import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './UI';

export const RequireAuth = ({ allowedRoles }) => {
  const { loading, isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spinner className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/app/transactions" replace />;
  }

  return <Outlet />;
};