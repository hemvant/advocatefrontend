import React from 'react';

const ACTIVITY_ICONS = {
  CASE_CREATED: '📋',
  CASE_UPDATED: '✏️',
  CASE_ASSIGNED: '👤',
  CASE_REASSIGNED: '🔄',
  TASK_CREATED: '📌',
  TASK_UPDATED: '✏️',
  TASK_ASSIGNED: '👤',
  TASK_REASSIGNED: '🔄',
  TASK_STARTED: '▶️',
  TASK_COMPLETED: '✅',
  STATUS_CHANGED: '📊'
};

export default function ActivityTimeline({ items, emptyMessage = 'No activity yet.' }) {
  if (!items || items.length === 0) {
    return <p className="text-gray-500 text-sm py-4">{emptyMessage}</p>;
  }
  const sorted = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return (
    <ul className="space-y-0">
      {sorted.map((item) => (
        <li key={item.id} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
          <span className="text-lg shrink-0" title={item.activity_type} aria-hidden>
            {ACTIVITY_ICONS[item.activity_type] || '•'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-800">{item.activity_summary || item.activity_type}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {item.User?.name && <span>{item.User.name}</span>}
              <span className="ml-2">{item.created_at ? new Date(item.created_at).toLocaleString() : ''}</span>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
