'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ORDER_STATUSES } from '@/lib/repos/order-statuses';
import { statusBadgeClass } from '@/lib/format';

export default function OrderStatusControl({ orderId, currentStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function save() {
    if (!status || status === currentStatus) return;
    setSaving(true); setMsg(''); setErr('');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Failed.'); return; }
      setMsg('Status updated.');
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(currentStatus)}`}>
        {currentStatus || '—'}
      </span>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={saving || status === currentStatus}
        onClick={save}
        className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving…' : 'Update'}
      </button>
      {msg && <span className="text-xs text-emerald-600">{msg}</span>}
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}