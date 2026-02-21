import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
        <p className="text-6xl font-bold text-primary/20 mb-2">404</p>
        <h1 className="text-xl font-bold text-primary mb-2">Page not found</h1>
        <p className="text-gray-600 text-sm mb-6">The page you are looking for does not exist or has been moved.</p>
        <Link to="/dashboard" className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Go to Dashboard</Link>
      </div>
    </div>
  );
}
