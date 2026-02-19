import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useOrgAuth } from '../context/OrgAuthContext';

const MODULE_LINKS = [
  { name: 'Client Management', path: '/clients', icon: '👤' },
  { name: 'Case Management', path: '/cases', icon: '📁' },
  { name: 'Document Management', path: '/documents', icon: '📄', end: false },
  { name: 'Billing', path: '/billing', icon: '💰' },
  { name: 'Calendar', path: '/calendar', icon: '📅' },
  { name: 'Reports', path: '/reports', icon: '📊' }
];

export default function OrgSidebar({ open = false, onClose }) {
  const { user, logout, hasModule, isOrgAdmin } = useOrgAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    onClose?.();
  };

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
        {MODULE_LINKS.filter((item) =>
          item.name === 'Calendar' ? (hasModule('Calendar') || hasModule('Case Management')) : hasModule(item.name)
        ).map((item) => (
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
        ))}
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
