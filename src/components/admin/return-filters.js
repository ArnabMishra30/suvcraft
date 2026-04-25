'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchableSelect from './searchable-select';

const STATUSES = [
  { value: '0', label: 'Pending' },
  { value: '1', label: 'Approved' },
  { value: '2', label: 'Rejected' },
  { value: '3', label: 'Return Pickedup' },
  { value: '4', label: 'Returned' },
];

export default function ReturnFilters({ sellers = [], products = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [draft, setDraft] = useState({
    status: params.get('status') || '',
    sellerId: params.get('sellerId') || '',
    productId: params.get('productId') || '',
  });

  useEffect(() => {
    setDraft({
      status: params.get('status') || '',
      sellerId: params.get('sellerId') || '',
      productId: params.get('productId') || '',
    });
  }, [params]);

  function update(k, v) {
    const next = { ...draft, [k]: v };
    setDraft(next);
    const sp = new URLSearchParams(params);
    if (v) sp.set(k, v); else sp.delete(k);
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Filters &amp; Search</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Filter By Status</label>
          <select value={draft.status} onChange={(e) => update('status', e.target.value)} className={inputCls}>
            <option value="">Select option</option>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Seller</label>
          <SearchableSelect value={draft.sellerId} onChange={(v) => update('sellerId', v)} options={sellers} placeholder="Search Seller…" />
        </div>
        <div>
          <label className={labelCls}>Filter By Product</label>
          <SearchableSelect value={draft.productId} onChange={(v) => update('productId', v)} options={products} placeholder="Search Products…" />
        </div>
      </div>
    </div>
  );
}