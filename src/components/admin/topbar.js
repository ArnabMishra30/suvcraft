'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Topbar({ user, onMenuClick }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const initial = (user?.username || user?.email || '?').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden -ml-2 mr-2 p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-sm">
            {initial}
          </span>
          <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-300">
            {user?.username || 'Admin'}
          </span>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 z-20 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg py-1">
              <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800">
                Signed in as<br />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{user?.email || user?.mobile}</span>
              </div>
              <button
                type="button"
                disabled={loggingOut}
                onClick={logout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60"
              >
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}