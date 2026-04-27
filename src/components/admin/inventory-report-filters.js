'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import DateRangePicker from './date-range-picker';
import SearchableSelect from './searchable-select';

export default function InventoryReportFilters({ sellers = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [draft, setDraft] = useState({
    from: params.get('from') || '',
    to: params.get('to') || '',
    sellerId: params.get('sellerId') || '',
  });

  useEffect(() => {
    setDraft({
      from: params.get('from') || '',
      to: params.get('to') || '',
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
    setDraft({ from: '', to: '', sellerId: '' });
    router.push(pathname);
  }

  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Date and time range</label>
        <DateRangePicker from={draft.from} to={draft.to} onChange={({ from, to }) => setDraft((d) => ({ ...d, from, to }))} />
      </div>
      <div>
        <label className={labelCls}>Seller</label>
        <SearchableSelect value={draft.sellerId} onChange={(v) => setDraft((d) => ({ ...d, sellerId: v }))} options={sellers} placeholder="Search Seller…" />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={apply}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-sm font-semibold text-white">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Apply
        </button>
        <button type="button" onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5m2 9a8 8 0 01-14 5" /></svg>
          Reset
        </button>
      </div>
    </div>
  );
}