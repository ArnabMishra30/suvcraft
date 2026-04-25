'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchableSelect from './searchable-select';

export default function CustomerTxnFilters({ customers = [], statuses = [], txnTypes = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(k, v) {
    const sp = new URLSearchParams(params);
    if (v) sp.set(k, v); else sp.delete(k);
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <label className={labelCls}>Customer</label>
        <SearchableSelect value={params.get('userId') || ''} onChange={(v) => update('userId', v)} options={customers} placeholder="Search Customer…" />
      </div>
      <div>
        <label className={labelCls}>Status</label>
        <select value={params.get('status') || ''} onChange={(e) => update('status', e.target.value)} className={inputCls}>
          <option value="">All</option>
          {statuses.map((s) => {
            const v = typeof s === 'string' ? s : s.value;
            const lbl = typeof s === 'string' ? s : s.label;
            return <option key={v} value={v}>{lbl}</option>;
          })}
        </select>
      </div>
      <div>
        <label className={labelCls}>Transaction Type</label>
        <select value={params.get('txnType') || ''} onChange={(e) => update('txnType', e.target.value)} className={inputCls}>
          <option value="">All</option>
          {txnTypes.map((t) => {
            const v = typeof t === 'string' ? t : t.value;
            const lbl = typeof t === 'string' ? t : t.label;
            return <option key={v} value={v}>{lbl}</option>;
          })}
        </select>
      </div>
    </div>
  );
}