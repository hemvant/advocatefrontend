import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from '../components/SuperAdminSidebar';
import MobileHeader from '../components/MobileHeader';

export default function SuperAdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      <div
        className="fixed inset-0 bg-black/50 z-20 transition-opacity md:hidden"
        style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <SuperAdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} title="AdvocateLearn Admin" />
      <main className="flex-1 overflow-auto bg-white pt-14 md:pt-0 md:ml-64 min-h-screen safe-area-bottom">
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
