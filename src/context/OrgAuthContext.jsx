import React, { createContext, useContext, useState, useEffect } from 'react';
import { orgGetMe, orgLogout } from '../services/orgApi';

const OrgAuthContext = createContext(null);

export function OrgAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await orgGetMe();
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
      await orgLogout();
    } finally {
      setUser(null);
    }
  };
  const refreshUser = () => fetchUser();

  const isOrgAdmin = user?.role === 'ORG_ADMIN';
  const assignedModules = user?.Modules || [];
  const hasModule = (name) => isOrgAdmin || assignedModules.some((m) => m.name === name);

  const value = {
    user,
    loading,
    loginSuccess,
    logout,
    refreshUser,
    isOrgAdmin,
    assignedModules,
    hasModule
  };

  return (
    <OrgAuthContext.Provider value={value}>
      {children}
    </OrgAuthContext.Provider>
  );
}

export function useOrgAuth() {
  const ctx = useContext(OrgAuthContext);
  if (!ctx) throw new Error('useOrgAuth must be used within OrgAuthProvider');
  return ctx;
}
