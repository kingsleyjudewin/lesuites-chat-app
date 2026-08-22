import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAccessToken as setApiAccessToken, setOnAuthLost } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback((token) => {
    setAccessTokenState(token);
    setApiAccessToken(token);
  }, []);

  const clearSession = useCallback(() => {
    applyToken(null);
    setUser(null);
  }, [applyToken]);

  useEffect(() => {
    setOnAuthLost(clearSession);
  }, [clearSession]);

  // Silent session restore on load, using the httpOnly refresh cookie the backend already sets.
  useEffect(() => {
    (async () => {
      try {
        const token = await api.refreshAccessToken();
        if (token) {
          applyToken(token);
          setUser(await api.get('/users/me'));
        }
      } catch {
        /* no valid session */
      } finally {
        setLoading(false);
      }
    })();
  }, [applyToken]);

  const login = useCallback(
    async (email, password) => {
      const data = await api.post('/auth/login', { email, password });
      applyToken(data.accessToken);
      setUser(data.user);
      return data.user;
    },
    [applyToken]
  );

  const register = useCallback(
    async (username, email, password) => {
      const data = await api.post('/auth/register', { username, email, password });
      applyToken(data.accessToken);
      setUser(data.user);
      return data.user;
    },
    [applyToken]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* proceed to clear local session regardless */
    }
    clearSession();
  }, [clearSession]);

  const updateUser = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), []);

  const value = useMemo(
    () => ({ user, accessToken, loading, login, register, logout, updateUser }),
    [user, accessToken, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
