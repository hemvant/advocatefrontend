import React from 'react';

export default function MobileHeader({ onMenuClick, title = 'AdvocateLearn' }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-primary text-white flex items-center gap-3 px-4 z-40 md:hidden border-b border-white/10 safe-area-top">
      <button
        type="button"
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-lg hover:bg-white/10 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary min-touch"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="text-lg font-semibold text-accent truncate">{title}</span>
    </header>
  );
}
