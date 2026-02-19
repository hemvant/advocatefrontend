import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MODULE_LINKS = [
  { name: 'Client Management', path: '/clients', icon: '👤' },
  { name: 'Case Management', path: '/cases', icon: '📁' },
  { name: 'Document Management', path: '/documents', icon: '📄' },
  { name: 'Billing', path: '/billing', icon: '💰' },
  { name: 'Calendar', path: '/calendar', icon: '📅' },
  { name: 'Reports', path: '/reports', icon: '📊' }
];

export default function Sidebar() {
  const { user, logout, hasModule, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const visibleLinks = MODULE_LINKS.filter((item) => hasModule(item.name));

  return (
    <aside className="fixed left-0 top-0 z-30 h-full w-64 bg-primary text-white flex flex-col shadow-lg">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-semibold text-accent">AdvocateLearn</h1>
        <p className="text-sm text-white/70 mt-1">{user?.name}</p>
        <p className="text-xs text-white/50">{user?.Role?.name}</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-white/10 hover:text-accent ${isActive ? 'bg-white/10 text-accent border-l-4 border-accent' : ''}`
          }
        >
          <span>🏠</span> Dashboard
        </NavLink>
        {visibleLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-white/10 hover:text-accent ${isActive ? 'bg-white/10 text-accent border-l-4 border-accent' : ''}`
            }
          >
            <span>{item.icon}</span> {item.name}
          </NavLink>
        ))}
        {isSuperAdmin && (
          <>
            <div className="my-2 border-t border-white/10" />
            <p className="px-6 py-2 text-xs font-semibold text-white/50 uppercase">Admin</p>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-white/10 hover:text-accent ${isActive ? 'bg-white/10 text-accent border-l-4 border-accent' : ''}`
              }
            >
              <span>👥</span> Users
            </NavLink>
            <NavLink
              to="/admin/modules"
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors hover:bg-white/10 hover:text-accent ${isActive ? 'bg-white/10 text-accent border-l-4 border-accent' : ''}`
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
          className="w-full flex items-center gap-3 px-4 py-2 text-sm rounded hover:bg-white/10 hover:text-accent transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
