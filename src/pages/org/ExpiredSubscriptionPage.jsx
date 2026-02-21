import React from 'react';
import { Link } from 'react-router-dom';

export default function ExpiredSubscriptionPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-primary mb-2">Your subscription has expired</h1>
        <p className="text-gray-600 text-sm mb-6">Renew your plan to continue using all features. Your data is safe.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/billing" className="inline-flex justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">
            Renew Plan
          </Link>
          <a href="mailto:support@advocatelearn.com" className="inline-flex justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            Contact Administrator
          </a>
        </div>
      </div>
    </div>
  );
}
