import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext';

export default function SuperAdminSidebar({ open = false, onClose }) {
  const { user, logout } = useSuperAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/super-admin/login');
  };

  const handleNavClick = () => onClose?.();

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
          <p className="text-sm text-white/70 mt-1">Super Admin</p>
          <p className="text-xs text-white/50 truncate">{user?.name}</p>
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
        <NavLink to="/super-admin/dashboard" onClick={handleNavClick} className={({ isActive }) => 'flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch' + (isActive ? ' bg-white/10 text-accent border-l-4 border-accent' : '')}>Dashboard</NavLink>
        <NavLink to="/super-admin/organizations" onClick={handleNavClick} className={({ isActive }) => 'flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch' + (isActive ? ' bg-white/10 text-accent border-l-4 border-accent' : '')}>Organizations</NavLink>
        <NavLink to="/super-admin/subscriptions" onClick={handleNavClick} className={({ isActive }) => 'flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch' + (isActive ? ' bg-white/10 text-accent border-l-4 border-accent' : '')}>Subscriptions</NavLink>
        <NavLink to="/super-admin/packages" onClick={handleNavClick} className={({ isActive }) => 'flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch' + (isActive ? ' bg-white/10 text-accent border-l-4 border-accent' : '')}>Packages</NavLink>
        <NavLink to="/super-admin/invoices" onClick={handleNavClick} className={({ isActive }) => 'flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch' + (isActive ? ' bg-white/10 text-accent border-l-4 border-accent' : '')}>Invoices</NavLink>
        <NavLink to="/super-admin/audit-logs" onClick={handleNavClick} className={({ isActive }) => 'flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch' + (isActive ? ' bg-white/10 text-accent border-l-4 border-accent' : '')}>Audit Logs</NavLink>
        <NavLink to="/super-admin/system-health" onClick={handleNavClick} className={({ isActive }) => 'flex items-center gap-3 px-6 py-3.5 text-sm transition-colors hover:bg-white/10 hover:text-accent min-touch' + (isActive ? ' bg-white/10 text-accent border-l-4 border-accent' : '')}>System Health</NavLink>
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-white/10 hover:text-accent transition-colors min-touch"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
