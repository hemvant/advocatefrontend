import React from 'react';

export default function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 flex gap-4 px-6 py-3">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-24" />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-6 py-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 bg-gray-100 rounded flex-1 max-w-[120px]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
