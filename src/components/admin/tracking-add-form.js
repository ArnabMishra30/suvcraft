'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TrackingAddForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ order_id: '', order_item_id: '', courier_agency: '', tracking_id: '', url: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true); setErr(''); setMsg('');
    try {
      const res = await fetch('/api/admin/orders/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      setMsg('Tracking saved.');
      setForm({ order_id: '', order_item_id: '', courier_agency: '', tracking_id: '', url: '' });
      router.refresh();
      setTimeout(() => { setMsg(''); setOpen(false); }, 1200);
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Tracking
      </button>
    );
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelCls = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Add Tracking</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" aria-label="Close">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {err && <div role="alert" className="mb-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">{err}</div>}
      {msg && <div role="status" className="mb-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">{msg}</div>}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label htmlFor="order_id" className={labelCls}>Order ID *</label>
            <input id="order_id" type="number" required value={form.order_id} onChange={(e) => update('order_id', e.target.value)} className={inputCls} placeholder="e.g. 1234" />
          </div>
          <div>
            <label htmlFor="order_item_id" className={labelCls}>Order Item ID</label>
            <input id="order_item_id" type="text" value={form.order_item_id} onChange={(e) => update('order_item_id', e.target.value)} className={inputCls} placeholder="optional" />
          </div>
          <div>
            <label htmlFor="courier_agency" className={labelCls}>Courier Agency</label>
            <input id="courier_agency" type="text" value={form.courier_agency} onChange={(e) => update('courier_agency', e.target.value)} className={inputCls} placeholder="DHL, BlueDart…" />
          </div>
          <div>
            <label htmlFor="tracking_id" className={labelCls}>Tracking ID *</label>
            <input id="tracking_id" type="text" required value={form.tracking_id} onChange={(e) => update('tracking_id', e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="url" className={labelCls}>Tracking URL</label>
            <input id="url" type="url" value={form.url} onChange={(e) => update('url', e.target.value)} className={inputCls} placeholder="https://…" />
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}