'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import PromoCodeFormModal from './promo-code-form-modal';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

const DISCOUNT_OPTIONS = [
  { value: '', label: 'Select Discount Type' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'amount', label: 'Amount' },
];
const STATUS_OPTIONS = [
  { value: '', label: 'Select option' },
  { value: '1', label: 'Active' },
  { value: '0', label: 'Deactive' },
];

export function PromoCodeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [draft, setDraft] = useState({
    discountType: params.get('discountType') || '',
    status: params.get('status') || '',
  });

  useEffect(() => {
    setDraft({
      discountType: params.get('discountType') || '',
      status: params.get('status') || '',
    });
  }, [params]);

  function applyFilters(next) {
    const sp = new URLSearchParams(params);
    if (next.discountType) sp.set('discountType', next.discountType); else sp.delete('discountType');
    if (next.status) sp.set('status', next.status); else sp.delete('status');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function setType(v) { const next = { ...draft, discountType: v }; setDraft(next); applyFilters(next); }
  function setStatus(v) { const next = { ...draft, status: v }; setDraft(next); applyFilters(next); }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filter By Discount Type</label>
        <select value={draft.discountType} onChange={(e) => setType(e.target.value)} className={inputCls}>
          {DISCOUNT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filter By Status</label>
        <select value={draft.status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export function AddPromoCodeButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-4 py-2 text-sm font-semibold border border-sky-200 dark:border-sky-900">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Promo Code
      </button>
      <PromoCodeFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function PromoCodeStatusToggle({ row }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const active = Number(row.status) === 1;
  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/promo-codes/${row.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: active ? 0 : 1 }),
      });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }
  return (
    <button type="button" onClick={toggle} disabled={busy}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium transition disabled:opacity-60 ${
        active
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {active ? 'Active' : 'Deactive'}
    </button>
  );
}

export function PromoCodeRowActions({ row }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  async function onDelete() {
    if (!confirm(`Delete promo code "${row.promo_code}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/promo-codes/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }
  return (
    <>
      <div className="inline-flex items-center gap-1">
        <button type="button" onClick={() => setEditOpen(true)} title="Edit"
          className="p-1.5 rounded-md text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button type="button" onClick={onDelete} disabled={busy} title="Delete"
          className="p-1.5 rounded-md text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
        </button>
      </div>
      <PromoCodeFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={row} />
    </>
  );
}