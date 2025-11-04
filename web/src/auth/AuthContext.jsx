// AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pc_auth');
      if (saved === '1') setIsAuthenticated(true);
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    try { localStorage.setItem('pc_auth', '1'); } catch (e) {}
  };

  const logout = () => {
    setIsAuthenticated(false);
    try { localStorage.removeItem('pc_auth'); } catch (e) {}
  };

  const value = useMemo(() => ({ isAuthenticated, login, logout }), [isAuthenticated]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

