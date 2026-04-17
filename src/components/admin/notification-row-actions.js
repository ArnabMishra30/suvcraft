'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NotificationRowActions({ id, readBy }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  async function onDelete() {
    if (!confirm('Delete this notification?')) return;
    setBusy('del'); setErr('');
    try {
      const res = await fetch(`/api/admin/system-notifications/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Delete failed.'); return; }
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy('');
    }
  }

  async function onToggle() {
    setBusy('toggle'); setErr('');
    try {
      const res = await fetch(`/api/admin/system-notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read_by: readBy ? 0 : 1 }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Update failed.'); return; }
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={busy === 'toggle'}
        onClick={onToggle}
        title={readBy ? 'Mark as unread' : 'Mark as read'}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60 text-sm"
      >
        {readBy ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        )}
        {readBy ? 'Unread' : 'Read'}
      </button>
      <button
        type="button"
        disabled={busy === 'del'}
        onClick={onDelete}
        title="Delete"
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60 text-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
        {busy === 'del' ? '…' : 'Delete'}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}