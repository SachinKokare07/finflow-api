import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);
const TOKEN_KEY = 'finflow_token';
const USER_KEY = 'finflow_user';

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistAuth = (token, user) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => readStoredUser());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const logout = () => {
    persistAuth(null, null);
    setToken(null);
    setUser(null);
  };

  const applyAuth = ({ token: nextToken, user: nextUser }) => {
    persistAuth(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    applyAuth(response);
    return response;
  };

  const register = async (payload) => {
    const response = await authApi.register(payload);
    applyAuth(response);
    return response;
  };

  const refreshProfile = async () => {
    if (!token) return null;
    const response = await authApi.me();
    if (response?.user) {
      setUser(response.user);
      persistAuth(token, response.user);
    }
    return response?.user || null;
  };

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      if (!token) {
        if (active) setLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch (error) {
        logout();
        setAuthError(error.message || 'Your session expired.');
      } finally {
        if (active) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      authError,
      isAuthenticated: Boolean(token && user),
      role: user?.role || null,
      login,
      register,
      logout,
      setUser,
      refreshProfile,
      clearAuthError: () => setAuthError(''),
    }),
    [authError, loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};