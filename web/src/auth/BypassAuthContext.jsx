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
    const saved = localStorage.getItem('pc_auth');
    if (saved === '1') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    localStorage.setItem('pc_auth', '1');
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('pc_auth');
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

