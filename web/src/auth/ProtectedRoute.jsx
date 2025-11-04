// ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { bypassAuth } from './flags';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (bypassAuth || isAuthenticated) {
    return children;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
}

