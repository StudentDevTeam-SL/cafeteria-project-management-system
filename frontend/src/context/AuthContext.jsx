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

/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

const formatApiError = (data, fallback) => {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;

  const [field, value] = Object.entries(data)[0] || [];
  if (!field) return fallback;

  const message = Array.isArray(value) ? value.join(' ') : String(value);
  return `${field}: ${message}`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    let initialUser = null;
    const token      = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try { 
        initialUser = JSON.parse(storedUser); 
      }
      catch (e) { 
        console.error('Failed to parse user', e);
        localStorage.removeItem('token'); 
        localStorage.removeItem('user'); 
      }
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(initialUser);
    setIsLoading(false);
  }, []);

  /**
   * login — authenticates via Django REST API
   */
  const login = async (username, password) => {
    try {
      const res = await api.post('auth/login/', { username, password });
      const { access, refresh, user: userData, login_activity_id: loginActivityId } = res.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      if (loginActivityId) {
        localStorage.setItem('login_activity_id', String(loginActivityId));
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Invalid credentials', { cause: error });
    }
  };

  /**
   * register — creates a public Staff/Employee account and stores its session.
   */
  const register = async (payload) => {
    try {
      const res = await api.post('auth/register/', payload);
      const { access, refresh, user: userData, login_activity_id: loginActivityId } = res.data;

      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      if (loginActivityId) {
        localStorage.setItem('login_activity_id', String(loginActivityId));
      }

      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(formatApiError(error.response?.data, 'Registration failed'), { cause: error });
    }
  };

  /**
   * googleSocialLogin — authenticates a verified google account ID token (credential) via Django REST API
   */
  const googleSocialLogin = async (credential) => {
    try {
      const res = await api.post('auth/google-social-login/', { credential });
      const { access, refresh, user: userData, login_activity_id: loginActivityId } = res.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      if (loginActivityId) {
        localStorage.setItem('login_activity_id', String(loginActivityId));
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to complete Google Sign-in', { cause: error });
    }
  };

  /** logout — clear user and session storage, optionally call backend to blacklist token */
  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        await api.post('auth/logout/', {
          refresh,
          login_activity_id: localStorage.getItem('login_activity_id'),
          reason: 'logout',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      localStorage.removeItem('login_activity_id');
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
      let newRole;
      if (prev.role === 'Employee' || prev.role === 'Staff') newRole = 'Manager';
      else if (prev.role === 'Manager') newRole = 'Admin';
      else newRole = 'Employee';
      const updated = { ...prev, role: newRole };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, googleSocialLogin, updateUser, switchRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
