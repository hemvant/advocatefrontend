import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-white ml-0 md:ml-64">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
