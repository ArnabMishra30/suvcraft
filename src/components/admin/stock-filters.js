'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchableSelect from './searchable-select';

export default function StockFilters({ sellers = [], categories = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [draft, setDraft] = useState({
    sellerId: params.get('sellerId') || '',
    categoryId: params.get('categoryId') || '',
  });

  useEffect(() => {
    setDraft({
      sellerId: params.get('sellerId') || '',
      categoryId: params.get('categoryId') || '',
    });
  }, [params]);

  function applyFilters(next) {
    const sp = new URLSearchParams(params);
    if (next.sellerId) sp.set('sellerId', next.sellerId); else sp.delete('sellerId');
    if (next.categoryId) sp.set('categoryId', next.categoryId); else sp.delete('categoryId');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function setSeller(v) {
    const next = { ...draft, sellerId: v };
    setDraft(next);
    applyFilters(next);
  }

  function setCategory(v) {
    const next = { ...draft, categoryId: v };
    setDraft(next);
    applyFilters(next);
  }

  function reset() {
    setDraft({ sellerId: '', categoryId: '' });
    router.push(pathname);
  }

  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
      <div>
        <label className={labelCls}>Seller</label>
        <SearchableSelect value={draft.sellerId} onChange={setSeller} options={sellers} placeholder="Search Seller…" />
      </div>
      <div>
        <label className={labelCls}>Category</label>
        <SearchableSelect value={draft.categoryId} onChange={setCategory} options={categories} placeholder="Search Category…" />
      </div>
      <div className="flex justify-start sm:justify-end">
        <button type="button" onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5m2 9a8 8 0 01-14 5" /></svg>
          Reset
        </button>
      </div>
    </div>
  );
}