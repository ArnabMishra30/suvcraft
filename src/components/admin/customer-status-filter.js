'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function CustomerStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get('status') ?? '';
  function change(v) {
    const sp = new URLSearchParams(params);
    if (v) sp.set('status', v); else sp.delete('status');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }
  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  return (
    <div className="max-w-xs">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filter By Status</label>
      <select value={value} onChange={(e) => change(e.target.value)} className={inputCls}>
        <option value="">All</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>
    </div>
  );
}