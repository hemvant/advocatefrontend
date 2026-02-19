import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-6">Welcome back, {user?.name}.</p>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-medium text-primary">{user?.Role?.name}</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium text-primary">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
