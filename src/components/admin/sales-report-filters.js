'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import DateRangePicker from './date-range-picker';
import SearchableSelect from './searchable-select';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function SalesReportFilters({ paymentMethods = [], statuses = [], sellers = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [draft, setDraft] = useState({
    from: params.get('from') || '',
    to: params.get('to') || '',
    paymentMethod: params.get('paymentMethod') || '',
    status: params.get('status') || '',
    sellerId: params.get('sellerId') || '',
  });

  useEffect(() => {
    setDraft({
      from: params.get('from') || '',
      to: params.get('to') || '',
      paymentMethod: params.get('paymentMethod') || '',
      status: params.get('status') || '',
      sellerId: params.get('sellerId') || '',
    });
  }, [params]);

  function apply() {
    const sp = new URLSearchParams(params);
    for (const [k, v] of Object.entries(draft)) {
      if (v) sp.set(k, v); else sp.delete(k);
    }
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function reset() {
    setDraft({ from: '', to: '', paymentMethod: '', status: '', sellerId: '' });
    router.push(pathname);
  }

  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto_auto] gap-3 items-end">
      <div>
        <label className={labelCls}>Date and time range:</label>
        <DateRangePicker from={draft.from} to={draft.to} onChange={({ from, to }) => setDraft((d) => ({ ...d, from, to }))} />
      </div>
      <div>
        <label className={labelCls}>Payment Method</label>
        <select className={inputCls} value={draft.paymentMethod} onChange={(e) => setDraft((d) => ({ ...d, paymentMethod: e.target.value }))}>
          <option value="">Select option</option>
          {paymentMethods.filter((p) => p.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Status</label>
        <select className={inputCls} value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>
          <option value="">Select option</option>
          {statuses.filter((p) => p.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Seller</label>
        <SearchableSelect value={draft.sellerId} onChange={(v) => setDraft((d) => ({ ...d, sellerId: v }))} options={sellers} placeholder="Search Seller…" />
      </div>
      <button type="button" onClick={apply}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-sm font-semibold text-white">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        Filter
      </button>
      <button type="button" onClick={reset}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5m2 9a8 8 0 01-14 5" /></svg>
        Reset
      </button>
    </div>
  );
}