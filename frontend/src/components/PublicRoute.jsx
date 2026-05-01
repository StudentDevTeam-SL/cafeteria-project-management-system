import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-dark"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-accent"></div></div>;

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
