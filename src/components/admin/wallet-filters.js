'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchableSelect from './searchable-select';

export default function WalletFilters({ sellers = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const status = params.get('status') ?? '';
  const sellerId = params.get('sellerId') ?? '';

  function update(k, v) {
    const sp = new URLSearchParams(params);
    if (v) sp.set(k, v); else sp.delete(k);
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Filter By Transaction Status</label>
        <select value={status} onChange={(e) => update('status', e.target.value)} className={inputCls}>
          <option value="">All</option>
          <option value="1">Success</option>
          <option value="0">Pending</option>
          <option value="2">Failed</option>
        </select>
      </div>
      <div>
        <label className={labelCls}>Seller</label>
        <SearchableSelect value={sellerId} onChange={(v) => update('sellerId', v)} options={sellers} placeholder="Search Seller…" />
      </div>
    </div>
  );
}