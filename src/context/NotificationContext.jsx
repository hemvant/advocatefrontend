import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const NotificationContext = createContext(null);

const DEFAULT_TTL = 5000;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback(({ type = 'info', message, title, ttl = DEFAULT_TTL }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message, title, ttl }]);
    if (ttl > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, ttl);
    }
  }, []);

  const success = useCallback((message, title = 'Success') => add({ type: 'success', message, title }), [add]);
  const error = useCallback((message, title = 'Error') => add({ type: 'error', message, title }), [add]);
  const warning = useCallback((message, title = 'Warning') => add({ type: 'warning', message, title }), [add]);
  const info = useCallback((message, title = 'Info') => add({ type: 'info', message, title }), [add]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = { success, error, warning, info, add, remove };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 max-w-md" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
