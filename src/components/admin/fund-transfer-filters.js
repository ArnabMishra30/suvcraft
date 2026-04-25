'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchableSelect from './searchable-select';

export default function FundTransferFilters({ deliveryBoys = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [draft, setDraft] = useState({ deliveryBoyId: params.get('deliveryBoyId') || '' });

  useEffect(() => {
    setDraft({ deliveryBoyId: params.get('deliveryBoyId') || '' });
  }, [params]);

  function apply() {
    const sp = new URLSearchParams(params);
    if (draft.deliveryBoyId) sp.set('deliveryBoyId', draft.deliveryBoyId); else sp.delete('deliveryBoyId');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function reset() {
    setDraft({ deliveryBoyId: '' });
    router.push(pathname);
  }

  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="space-y-4">
      <div className="max-w-md">
        <label className={labelCls}>Filter by Delivery Boy</label>
        <SearchableSelect value={draft.deliveryBoyId} onChange={(v) => setDraft({ deliveryBoyId: v })} options={deliveryBoys} placeholder="Select Delivery Boy" />
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={apply} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-sm font-semibold text-white">
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