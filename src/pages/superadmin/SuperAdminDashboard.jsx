import React from 'react';
import { Link } from 'react-router-dom';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';

export default function SuperAdminDashboard() {
  const { user } = useSuperAdminAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Super Admin Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome, {user?.name}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-2">Platform Overview</h2>
          <p className="text-gray-600 text-sm">Manage organizations, subscriptions, and module assignments from the Organizations page.</p>
          <Link to="/super-admin/organizations" className="mt-4 inline-block text-accent font-medium hover:underline">
            Go to Organizations →
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-2">Quick Actions</h2>
          <ul className="text-gray-600 text-sm space-y-2">
            <li>• Create new organization</li>
            <li>• Assign modules to organizations</li>
            <li>• Activate or deactivate organizations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
