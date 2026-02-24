import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrgAuth } from '../context/OrgAuthContext';

const ACTIONS = [
  { label: 'Add Case', path: '/cases/create', icon: '📁', moduleName: 'Case Management' },
  { label: 'Add Client', path: '/clients/create', icon: '👤', moduleName: 'Client Management' },
  { label: 'Add Task', path: '/tasks', icon: '✅', moduleName: 'Case Management' },
  { label: 'Add Hearing', path: '/calendar', icon: '📅', moduleName: 'Calendar' }
];

export default function QuickActionFab() {
  const { hasModule, isModuleInPlan } = useOrgAuth();
  const [open, setOpen] = useState(false);

  const items = ACTIONS.filter((a) => {
    const name = a.moduleName === 'Calendar' ? 'Calendar' : a.moduleName;
    return isModuleInPlan(name) && (name === 'Calendar' ? (hasModule('Calendar') || hasModule('Case Management')) : hasModule(name));
  });

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[35] flex flex-col items-end gap-2 safe-area-bottom">
      {open && (
        <div className="flex flex-col gap-2 transition-opacity duration-200">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 min-h-[48px] touch-manipulation"
              onClick={() => setOpen(false)}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-accent text-primary shadow-lg hover:bg-accent/90 focus:ring-2 focus:ring-accent focus:ring-offset-2 touch-manipulation transition-transform active:scale-95"
        aria-label={open ? 'Close quick actions' : 'Quick actions'}
        aria-expanded={open}
      >
        <svg
          className={`w-6 h-6 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
