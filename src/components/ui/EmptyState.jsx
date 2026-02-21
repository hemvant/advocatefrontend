import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-5xl text-gray-300 mb-4" aria-hidden="true">{icon}</div>}
      <h3 className="text-lg font-semibold text-primary mb-1">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
