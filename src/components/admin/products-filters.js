'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ProductsFilters({ categories = [], brands = [], sellers = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [draft, setDraft] = useState({
    categoryId: params.get('categoryId') || '',
    status: params.get('status') || '',
    sellerId: params.get('sellerId') || '',
    brandId: params.get('brandId') || '',
  });

  function update(k, v) {
    const next = { ...draft, [k]: v };
    setDraft(next);
    const sp = new URLSearchParams(params);
    if (v) sp.set(k, v); else sp.delete(k);
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function reset() {
    setDraft({ categoryId: '', status: '', sellerId: '', brandId: '' });
    router.push(pathname);
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelCls = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
      <div>
        <label htmlFor="categoryId" className={labelCls}>Category</label>
        <select id="categoryId" value={draft.categoryId} onChange={(e) => update('categoryId', e.target.value)} className={inputCls}>
          <option value="">Search Category…</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="status" className={labelCls}>Status</label>
        <select id="status" value={draft.status} onChange={(e) => update('status', e.target.value)} className={inputCls}>
          <option value="">Select option</option>
          <option value="1">Approved</option>
          <option value="2">Not-Approved</option>
          <option value="0">Deactivated</option>
        </select>
      </div>
      <div>
        <label htmlFor="sellerId" className={labelCls}>Seller</label>
        <select id="sellerId" value={draft.sellerId} onChange={(e) => update('sellerId', e.target.value)} className={inputCls}>
          <option value="">Search Seller…</option>
          {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="brandId" className={labelCls}>Brand</label>
        <select id="brandId" value={draft.brandId} onChange={(e) => update('brandId', e.target.value)} className={inputCls}>
          <option value="">Search Brand…</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-full sm:w-auto"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5m2 9a8 8 0 01-14 5" /></svg>
          Reset
        </button>
      </div>
    </div>
  );
}