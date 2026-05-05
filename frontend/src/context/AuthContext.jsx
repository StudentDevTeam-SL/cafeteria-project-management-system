/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global authentication state.
 * • login()       — authenticates via Django JWT
 * • logout()      — clears session
 * • updateUser()  — PATCHes profile fields and syncs local state
 * • switchRole()  — toggle Admin ↔ Employee for testing role-based UI
 * ─────────────────────────────────────────────────────────────
 */

import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token      = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try { setUser(JSON.parse(storedUser)); }
      catch { localStorage.removeItem('token'); localStorage.removeItem('user'); }
    }
    setIsLoading(false);
  }, []);

  /**
   * login — authenticates via Django REST API
   */
  const login = async (username, password) => {
    try {
      const res = await import('../api/axios').then(module => module.default.post('auth/login/', { username, password }));
      const { access, refresh, user: userData } = res.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Invalid credentials');
    }
  };

  /** logout — clear user and session storage, optionally call backend to blacklist token */
  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        await import('../api/axios').then(module => module.default.post('auth/logout/', { refresh }));
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
    }
  };

  /**
   * updateUser — PATCH profile fields to the backend, then sync local state.
   * @param {object} fields — partial user fields e.g. { first_name, last_name, email, phone_number }
   */
  const updateUser = async (fields) => {
    if (!user?.id) throw new Error('Not authenticated');
    const res = await api.patch(`auth/users/${user.id}/`, fields);
    const updated = { ...user, ...res.data };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  /**
   * switchRole — toggle between Admin and Employee view for UI testing.
   * This is a FRONTEND-ONLY helper; remove when the real backend is connected.
   */
  const switchRole = () => {
    setUser(prev => {
      if (!prev) return prev;
      const newRole = prev.role === 'Admin' ? 'Employee' : 'Admin';
      const updated = { ...prev, role: newRole };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, switchRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
