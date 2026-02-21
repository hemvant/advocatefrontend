import React from 'react';
import LoadingSpinner from '../LoadingSpinner';

export default function Button({ type = 'button', variant = 'primary', children, loading = false, disabled, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-accent',
    secondary: 'border border-primary text-primary hover:bg-primary/5 focus:ring-primary',
    danger: 'bg-danger text-white hover:bg-red-800 focus:ring-danger',
    ghost: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400'
  };
  const cn = [base, variants[variant] || variants.primary, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={cn} disabled={disabled || loading} {...props}>
      {loading && <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-accent" />}
      {children}
    </button>
  );
}
