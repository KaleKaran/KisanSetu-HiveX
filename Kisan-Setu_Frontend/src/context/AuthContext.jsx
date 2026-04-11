import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem('kisan_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [dataMode, setDataMode] = useState(() => localStorage.getItem('kisan_data_mode') || 'live');

  useEffect(() => {
    if (session) localStorage.setItem('kisan_session', JSON.stringify(session));
    else localStorage.removeItem('kisan_session');
  }, [session]);

  useEffect(() => {
    localStorage.setItem('kisan_data_mode', dataMode);
  }, [dataMode]);

  const apiJson = useCallback(
    async (path, options = {}) => {
      const headers = {
        'Content-Type': 'application/json',
        'X-Data-Mode': dataMode,
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers,
      };
      return fetch(`${API_BASE}${path}`, { ...options, headers });
    },
    [session, dataMode]
  );

  const logout = useCallback(() => setSession(null), []);

  const value = useMemo(
    () => ({
      session,
      setSession,
      dataMode,
      setDataMode,
      apiJson,
      logout,
    }),
    [session, dataMode, apiJson, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
