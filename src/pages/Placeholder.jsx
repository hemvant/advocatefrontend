import React from 'react';
import { useLocation } from 'react-router-dom';

export default function Placeholder() {
  const location = useLocation();
  const name = location.pathname.split('/').filter(Boolean).pop() || 'Module';
  const title = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
      <p className="text-gray-600">This module is under development.</p>
    </div>
  );
}
