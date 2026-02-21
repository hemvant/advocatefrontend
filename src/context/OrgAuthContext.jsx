import React, { createContext, useContext, useState, useEffect } from 'react';
import { orgGetMe, orgLogout, getMyModules } from '../services/orgApi';

const OrgAuthContext = createContext(null);

export function OrgAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);

  const fetchUser = async () => {
    try {
      const { data } = await orgGetMe();
      setUser(data.user);
      if (data.user) {
        try {
          const modRes = await getMyModules();
          setSubscriptionInfo(modRes.data?.data ?? null);
        } catch {
          setSubscriptionInfo(null);
        }
      } else {
        setSubscriptionInfo(null);
      }
    } catch {
      setUser(null);
      setSubscriptionInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const handleLogout = () => { setUser(null); setSubscriptionInfo(null); };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const loginSuccess = (userData) => setUser(userData);
  const logout = async () => {
    try {
      await orgLogout();
    } finally {
      setUser(null);
      setSubscriptionInfo(null);
    }
  };
  const refreshUser = () => fetchUser();

  const isOrgAdmin = user?.role === 'ORG_ADMIN';
  const assignedModules = user?.Modules || [];
  const allowedModuleNames = subscriptionInfo?.allowedModules?.map((m) => m.name) ?? [];
  const hasModule = (name) => isOrgAdmin || assignedModules.some((m) => m.name === name);
  const isModuleInPlan = (name) => allowedModuleNames.length === 0 || allowedModuleNames.includes(name);

  const value = {
    user,
    loading,
    loginSuccess,
    logout,
    refreshUser,
    isOrgAdmin,
    assignedModules,
    hasModule,
    subscriptionInfo,
    isModuleInPlan
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
