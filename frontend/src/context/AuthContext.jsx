/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Global authentication state.
 * • login()      — mock auth (replace with Django JWT when ready)
 * • logout()     — clears session
 * • switchRole() — toggle Admin ↔ Employee for testing role-based UI
 * ─────────────────────────────────────────────────────────────
 */

import { createContext, useState, useEffect } from 'react';

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
   * login — mock login with two demo accounts.
   * Replace setTimeout block with: axios.post('/api/auth/login/', { username, password })
   */
  const login = (username, password) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === 'admin' && password === 'admin') {
          const u = { id: 1, username: 'admin', role: 'Admin', email: 'admin@cafe.com', full_name: 'Super Admin' };
          setUser(u);
          localStorage.setItem('token', 'fake-jwt-token-admin');
          localStorage.setItem('user', JSON.stringify(u));
          resolve(u);
        } else if (username === 'employee' && password === 'employee') {
          const u = { id: 2, username: 'employee', role: 'Employee', email: 'emp@cafe.com', full_name: 'John Doe' };
          setUser(u);
          localStorage.setItem('token', 'fake-jwt-token-emp');
          localStorage.setItem('user', JSON.stringify(u));
          resolve(u);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });

  /** logout — clear user and session storage */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    <AuthContext.Provider value={{ user, login, logout, switchRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
