/**
 * Minimal AuthContext for bypass authentication
 * Uses localStorage to persist isAuthenticated state
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const BypassAuthContext = createContext(null);

export function BypassAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load persisted auth state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pc_auth');
      if (saved === '1') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem('pc_auth', '1');
    } catch (e) {
      // ignore storage errors
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('pc_auth');
    } catch (e) {
      // ignore storage errors
    }
  };

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated]
  );

  return (
    <BypassAuthContext.Provider value={value}>
      {children}
    </BypassAuthContext.Provider>
  );
}

export const useBypassAuth = () => {
  const context = useContext(BypassAuthContext);
  if (!context) {
    throw new Error('useBypassAuth must be used within BypassAuthProvider');
  }
  return context;
};

