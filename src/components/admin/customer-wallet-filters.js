'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchableSelect from './searchable-select';

const STATUSES = [
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
];

const TXN_TYPES = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
  { value: 'cod', label: 'COD' },
  { value: 'phonepe', label: 'Phonepe' },
  { value: 'razorpay', label: 'Razorpay' },
  { value: 'stripe', label: 'Stripe' },
];

export default function CustomerWalletFilters({ customers = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [draft, setDraft] = useState({
    userId: params.get('userId') || '',
    status: params.get('status') || '',
    txnType: params.get('txnType') || '',
  });

  useEffect(() => {
    setDraft({
      userId: params.get('userId') || '',
      status: params.get('status') || '',
      txnType: params.get('txnType') || '',
    });
  }, [params]);

  function update(k, v) { setDraft((d) => ({ ...d, [k]: v })); }

  function apply() {
    const sp = new URLSearchParams(params);
    for (const [k, v] of Object.entries(draft)) {
      if (v) sp.set(k, v); else sp.delete(k);
    }
    sp.delete('page');
    sp.set('tab', 'wallet');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function reset() {
    setDraft({ userId: '', status: '', txnType: '' });
    const sp = new URLSearchParams();
    sp.set('tab', 'wallet');
    router.push(`${pathname}?${sp.toString()}`);
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Customer</label>
          <SearchableSelect value={draft.userId} onChange={(v) => update('userId', v)} options={customers} placeholder="Search Customer…" />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select value={draft.status} onChange={(e) => update('status', e.target.value)} className={inputCls}>
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Transaction Type</label>
          <select value={draft.txnType} onChange={(e) => update('txnType', e.target.value)} className={inputCls}>
            <option value="">All</option>
            {TXN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={apply} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          Filter
        </button>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5m2 9a8 8 0 01-14 5" /></svg>
          Reset
        </button>
      </div>
    </div>
  );
}