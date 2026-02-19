import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext';

export default function SuperAdminProtectedRoute({ children }) {
  const { user, loading } = useSuperAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/super-admin/login" state={{ from: location }} replace />;
  }

  return children;
}
