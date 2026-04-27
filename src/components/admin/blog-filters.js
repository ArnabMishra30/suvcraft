'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchableSelect from './searchable-select';

export default function BlogFilters({ categories = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [categoryId, setCategoryId] = useState(params.get('categoryId') || '');

  useEffect(() => { setCategoryId(params.get('categoryId') || ''); }, [params]);

  function setAndApply(v) {
    setCategoryId(v);
    const sp = new URLSearchParams(params);
    if (v) sp.set('categoryId', v); else sp.delete('categoryId');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <div className="max-w-md">
      <label className={labelCls}>Filter By Category</label>
      <SearchableSelect value={categoryId} onChange={setAndApply} options={categories} placeholder="Select Category" />
    </div>
  );
}