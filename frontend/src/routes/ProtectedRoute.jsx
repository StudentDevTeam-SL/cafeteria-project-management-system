import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';

/**
 * Protects a route.
 * - requireAuth  → redirects to /login if not authenticated
 * - requireAdmin → redirects to / if user is not admin
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
