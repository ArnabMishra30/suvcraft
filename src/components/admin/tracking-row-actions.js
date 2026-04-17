'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TrackingRowActions({ id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onDelete() {
    if (!confirm('Delete this tracking entry?')) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/admin/orders/tracking/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Delete failed.'); return; }
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={onDelete}
        title="Delete"
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60 text-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
        {busy ? '…' : 'Delete'}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}