import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useOrgAuth } from '../context/OrgAuthContext';
import OrgSidebar from '../components/OrgSidebar';
import MobileHeader from '../components/MobileHeader';
import ExpiredSubscriptionPage from '../pages/org/ExpiredSubscriptionPage';

export default function OrgLayout() {
  const { subscriptionInfo } = useOrgAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [offline, setOffline] = useState(false);
  const isExpired = subscriptionInfo?.isExpired === true;
  const allowedWhenExpired = ['/billing', '/profile'];
  const showExpiredPage = isExpired && !allowedWhenExpired.some((p) => location.pathname === p || location.pathname.startsWith(p + '/'));

  useEffect(() => {
    setOffline(!navigator.onLine);
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => { window.removeEventListener('offline', onOffline); window.removeEventListener('online', onOnline); };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {offline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-medium safe-area-top">
          You are offline. Some features may be unavailable.
        </div>
      )}
      <div
        className="fixed inset-0 bg-black/50 z-20 transition-opacity md:hidden"
        style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <OrgSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <MobileHeader onMenuClick={() => setSidebarOpen(true)} title="AdvocateLearn" />
      <main className={`flex-1 overflow-auto bg-white pt-14 md:pt-0 md:ml-64 min-h-screen safe-area-bottom ${offline ? 'pt-20 md:pt-10' : ''}`}>
        <div className="p-4 sm:p-6">
          {showExpiredPage ? <ExpiredSubscriptionPage /> : <Outlet />}
        </div>
      </main>
    </div>
  );
}
