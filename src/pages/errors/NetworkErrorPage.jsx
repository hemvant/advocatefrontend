import React from 'react';
import { Link } from 'react-router-dom';

export default function NetworkErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
        <p className="text-5xl mb-2" aria-hidden="true">📡</p>
        <h1 className="text-xl font-bold text-primary mb-2">Connection problem</h1>
        <p className="text-gray-600 text-sm mb-6">We could not reach the server. Check your internet connection and try again.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Try again</button>
          <Link to="/dashboard" className="inline-block px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Go to Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
