import React, { createContext, useContext, useState, useEffect } from 'react';
import { superAdminGetMe, superAdminLogout } from '../services/superAdminApi';

const SuperAdminAuthContext = createContext(null);

export function SuperAdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await superAdminGetMe();
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
    const handleLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const loginSuccess = (userData) => setUser(userData);
  const logout = async () => {
    try {
      await superAdminLogout();
    } finally {
      setUser(null);
    }
  };
  const refreshUser = () => fetchUser();

  const value = { user, loading, loginSuccess, logout, refreshUser };
  return (
    <SuperAdminAuthContext.Provider value={value}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
}

export function useSuperAdminAuth() {
  const ctx = useContext(SuperAdminAuthContext);
  if (!ctx) throw new Error('useSuperAdminAuth must be used within SuperAdminAuthProvider');
  return ctx;
}
