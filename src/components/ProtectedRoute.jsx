import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOrgAuth } from '../context/OrgAuthContext';

export default function ProtectedRoute({ children, requireOrgAdmin = false }) {
  const { user, loading } = useOrgAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireOrgAdmin && user.role !== 'ORG_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
