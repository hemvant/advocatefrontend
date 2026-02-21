import React from 'react';
import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
        <p className="text-6xl font-bold text-primary/20 mb-2">403</p>
        <h1 className="text-xl font-bold text-primary mb-2">Access denied</h1>
        <p className="text-gray-600 text-sm mb-6">You do not have permission to view this page.</p>
        <Link to="/dashboard" className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-accent focus:ring-offset-2">Go to Dashboard</Link>
      </div>
    </div>
  );
}
