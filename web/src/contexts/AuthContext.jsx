import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getMe, signOut as signOutApi } from '../lib/auth.js';

const AuthContext = createContext(null);

/**
 * AuthProvider - Manages authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'authenticated' | 'unauthenticated'

  /**
   * Load user information on app boot
   */
  const refresh = useCallback(async () => {
    try {
      setStatus('loading');
      // getMe() now handles GitHub Pages mock user internally
      const userData = await getMe();
      setUser({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        siteIds: userData.siteIds || [],
      });
      setRoles(userData.roles || []);
      setPermissions(userData.permissions || []);
      setStatus('authenticated');
    } catch (error) {
      // On GitHub Pages, getMe() should never throw (returns mock user)
      // But if it does, check for mockUser in localStorage as fallback
      const isGitHubPages = typeof window !== 'undefined' && window.location.host.endsWith('github.io');
      if (isGitHubPages) {
        const mockUser = JSON.parse(localStorage.getItem('mockUser') || 'null');
        if (mockUser) {
          setUser({
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            siteIds: mockUser.siteIds || [],
          });
          setRoles(mockUser.roles || []);
          setPermissions(mockUser.permissions || []);
          setStatus('authenticated');
          return;
        }
      }
      setUser(null);
      setRoles([]);
      setPermissions([]);
      setStatus('unauthenticated');
    }
  }, []);

  /**
   * Sign in user (called after successful login/MFA)
   */
  const signIn = useCallback(async () => {
    await refresh();
  }, [refresh]);

  /**
   * Sign out user
   */
  const signOut = useCallback(async () => {
    try {
      await signOutApi();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
      setRoles([]);
      setPermissions([]);
      setStatus('unauthenticated');
    }
  }, []);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role) => {
    return roles.includes(role);
  }, [roles]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permission) => {
    return permissions.includes(permission);
  }, [permissions]);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return requiredRoles.some(role => roles.includes(role));
  }, [roles]);

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback((requiredPermissions) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return requiredPermissions.some(permission => permissions.includes(permission));
  }, [permissions]);

  // Load user on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = {
    user,
    roles,
    permissions,
    status,
    signIn,
    signOut,
    refresh,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook - Access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

