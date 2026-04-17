'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function NotificationsControls() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const readBy = params.get('readBy') || '';

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  function changeReadBy(value) {
    const sp = new URLSearchParams(params);
    if (value) sp.set('readBy', value); else sp.delete('readBy');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  async function markAll() {
    setBusy(true); setToast(null);
    try {
      const res = await fetch('/api/admin/system-notifications/mark-all-read', { method: 'POST' });
      const json = await res.json();
      setToast({ ok: !json.error, msg: json.message || (json.error ? 'Failed' : 'Done.') });
      router.refresh();
    } catch {
      setToast({ ok: false, msg: 'Network error.' });
    } finally {
      setBusy(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 min-w-0 max-w-xs">
          <label htmlFor="readBy" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Filter By Message Type</label>
          <select
            id="readBy"
            value={readBy}
            onChange={(e) => changeReadBy(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Messages</option>
            <option value="1">Read</option>
            <option value="0">Un-Read</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={markAll}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            {busy ? 'Working…' : 'Mark all as read'}
          </button>
          {toast && (
            <span className={`text-xs font-medium ${toast.ok ? 'text-emerald-600' : 'text-red-600'}`}>{toast.msg}</span>
          )}
        </div>
      </div>
    </div>
  );
}