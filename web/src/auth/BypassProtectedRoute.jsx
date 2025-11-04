/**
 * ProtectedRoute that respects bypass authentication
 * Allows access when bypassAuth is enabled or when user is authenticated
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useBypassAuth } from './BypassAuthContext';
import { bypassAuth } from './flags';

export default function BypassProtectedRoute({ children }) {
  const { isAuthenticated } = useBypassAuth();
  const location = useLocation();

  // Allow access if bypass is enabled or user is authenticated
  if (bypassAuth || isAuthenticated) {
    return children;
  }

  // Redirect to login, preserving the intended destination
  return <Navigate to="/login" state={{ from: location }} replace />;
}

