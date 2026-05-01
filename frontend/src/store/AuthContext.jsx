import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin } from '../services/mockApi.js';
import { setAuthToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(null);

  const isAuthenticated = Boolean(token);
  const isAdmin = user?.role === 'admin';

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    setToken(data.token);
    setUser(data.user);
    setAuthToken(data.token);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
