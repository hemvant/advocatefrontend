import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logout as apiLogout } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const loginSuccess = (userData) => setUser(userData);
  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  };
  const refreshUser = () => fetchUser();

  const isSuperAdmin = user?.Role?.name === 'SUPER_ADMIN';
  const assignedModules = user?.Modules || [];
  const hasModule = (name) => isSuperAdmin || assignedModules.some((m) => m.name === name);

  const value = {
    user,
    loading,
    loginSuccess,
    logout,
    refreshUser,
    isSuperAdmin,
    assignedModules,
    hasModule
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
