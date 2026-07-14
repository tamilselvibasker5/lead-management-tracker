import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../utils/storage';
import * as api from '../services/api';

/* ──────────────────── Context ──────────────────── */

const AuthContext = createContext(null);

/**
 * Custom hook to consume auth state from any component.
 * @returns {{ user: object|null, role: string|null, token: string|null, isAuthenticated: boolean, login: Function, logout: Function, loading: boolean }}
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}

/* ──────────────────── Provider ──────────────────── */

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // hydration in progress

  /* ── Hydrate from localStorage on mount ── */
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored?.user && stored?.token) {
      setUser(stored.user);
      setToken(stored.token);
    }
    setLoading(false);
  }, []);

  /* ── Login ── */
  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password); // throws on failure
    setUser(data.user);
    setToken(data.token);
    setStoredAuth(data);
    return data;
  }, []);

  /* ── Logout ── */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearStoredAuth();
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    token,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
