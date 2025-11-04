import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Home } from 'lucide-react';

/**
 * ProtectedRoute - Guards routes that require authentication and optionally specific roles/permissions
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Route content to render
 * @param {string[]} [props.requiredRoles] - Roles that can access this route
 * @param {string[]} [props.requiredPermissions] - Permissions required to access this route
 */
export default function ProtectedRoute({ children, requiredRoles, requiredPermissions }) {
  const { isAuthenticated, isLoading, hasAnyRole, hasAnyPermission } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400 mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // Check role requirements
  if (requiredRoles && requiredRoles.length > 0) {
    if (!hasAnyRole(requiredRoles)) {
      return <ForbiddenScreen />;
    }
  }

  // Check permission requirements
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!hasAnyPermission(requiredPermissions)) {
      return <ForbiddenScreen />;
    }
  }

  // All checks passed, render children
  return children;
}

/**
 * 403 Forbidden Screen
 */
function ForbiddenScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center max-w-md px-4">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 mb-2">Access Denied</h1>
          <p className="text-zinc-400">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors"
        >
          <Home size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

