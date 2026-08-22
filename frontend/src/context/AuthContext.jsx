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
