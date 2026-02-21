import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useOrgAuth } from '../context/OrgAuthContext';

const MODULE_LINKS = [
  { name: 'Client Management', path: '/clients', icon: '👤', moduleName: 'Client Management' },
  { name: 'Case Management', path: '/cases', icon: '📁', moduleName: 'Case Management' },
  { name: 'Courts', path: '/courts', icon: '⚖️', moduleName: 'Case Management' },
  { name: 'Tasks', path: '/tasks', icon: '✅', moduleName: 'Case Management' },
  { name: 'Document Management', path: '/documents', icon: '📄', end: false, moduleName: 'Document Management' },
  { name: 'Billing', path: '/billing', icon: '💰', moduleName: 'Billing' },
  { name: 'Calendar', path: '/calendar', icon: '📅', moduleName: 'Calendar' },
  { name: 'Reports', path: '/reports', icon: '📊', moduleName: 'Reports' },
  { name: 'Audit Logs', path: '/audit-logs', icon: '📋', moduleName: 'Reports' }
];

function UpgradeModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-primary mb-2">Upgrade Plan</h3>
        <p className="text-gray-600 text-sm mb-4">This feature is not included in your current plan. Contact your administrator to upgrade.</p>
        <div className="flex gap-2">
          <NavLink to="/billing" className="flex-1 text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium" onClick={onClose}>Upgrade Plan</NavLink>
          <a href="mailto:support@advocatelearn.com" className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Contact Administrator</a>
        </div>
      </div>
    </div>
  );
}

export default function OrgSidebar({ open = false, onClose }) {
  const { user, logout, hasModule, isOrgAdmin, subscriptionInfo, isModuleInPlan } = useOrgAuth();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    onClose?.();
  };

  const getModuleName = (item) => item.moduleName || item.name;

  const sidebarClasses = [
    'fixed left-0 top-0 z-30 h-full w-64 max-w-[85vw] bg-primary text-white flex flex-col shadow-lg transition-transform duration-200 ease-out',
    open ? 'translate-x-0' : '-translate-x-full',
    'md:translate-x-0 md:max-w-none'
  ].join(' ');

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-between p-4 border-b border-white/10 md:p-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-accent truncate">AdvocateLearn</h1>
          <p className="text-sm text-white/70 truncate mt-1">{user?.name}</p>
          <p className="text-xs text-white/50 truncate">{user?.organization?.name}</p>
          <p className="text-xs text-white/50 truncate">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-2 -mr-2 rounded-lg hover:bg-white/10 min-touch flex-shrink-0"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 overscroll-contain">
        <NavLink
          to="/dashboard"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch ${isActive ? 'bg-white/10 text-accent border-l-4 border-accent' : ''}`
          }
        >
          <span>🏠</span> Dashboard
        </NavLink>
        {MODULE_LINKS.map((item) => {
          const moduleName = getModuleName(item);
          const inPlan = item.name === 'Calendar' ? (isModuleInPlan('Calendar') || isModuleInPlan('Case Management')) : isModuleInPlan(moduleName);
          const hasAccess = item.name === 'Calendar' ? (hasModule('Calendar') || hasModule('Case Management')) : hasModule(moduleName);
          if (!inPlan) {
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => { setUpgradeModalOpen(true); onClose?.(); }}
                className="flex items-center gap-3 px-6 py-3.5 text-sm text-white/50 cursor-not-allowed min-touch w-full text-left"
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.name}</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              </button>
            );
          }
          if (!hasAccess) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end === false ? false : true}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch ${isActive ? 'bg-white/10 text-accent border-l-4 border-accent' : ''}`
              }
            >
              <span>{item.icon}</span> {item.name}
            </NavLink>
          );
        })}
        {upgradeModalOpen && <UpgradeModal onClose={() => setUpgradeModalOpen(false)} />}
        {isOrgAdmin && (
          <>
            <div className="my-2 border-t border-white/10" />
            <p className="px-6 py-2 text-xs font-semibold text-white/50 uppercase">Admin</p>
            <NavLink
              to="/employees"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch ${isActive ? 'bg-white/10 text-accent border-l-4 border-accent' : ''}`
              }
            >
              <span>👥</span> Employees
            </NavLink>
            <NavLink
              to="/modules"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch ${isActive ? 'bg-white/10 text-accent border-l-4 border-accent' : ''}`
              }
            >
              <span>🧩</span> Modules
            </NavLink>
          </>
        )}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-white/10 hover:text-accent transition-colors min-touch"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
