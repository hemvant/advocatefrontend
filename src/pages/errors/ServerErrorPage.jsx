import React from 'react';
import { Link } from 'react-router-dom';

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
        <p className="text-6xl font-bold text-primary/20 mb-2">500</p>
        <h1 className="text-xl font-bold text-primary mb-2">Server error</h1>
        <p className="text-gray-600 text-sm mb-6">Something went wrong on our end. Please try again later.</p>
        <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 mr-2">Refresh</button>
        <Link to="/dashboard" className="inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Go to Dashboard</Link>
      </div>
    </div>
  );
}
