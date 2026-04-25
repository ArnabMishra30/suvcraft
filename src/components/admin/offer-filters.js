'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const TYPE_OPTIONS = [
  { value: '', label: 'Select Type' },
  { value: 'default', label: 'Default' },
  { value: 'categories', label: 'Category' },
  { value: 'products', label: 'Product' },
  { value: 'offer_url', label: 'Offer URL' },
];

export default function OfferFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [type, setType] = useState(params.get('type') || '');

  useEffect(() => { setType(params.get('type') || ''); }, [params]);

  function setAndApply(v) {
    setType(v);
    const sp = new URLSearchParams(params);
    if (v) sp.set('type', v); else sp.delete('type');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';
  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="max-w-md">
      <label className={labelCls}>Filter By Type</label>
      <select value={type} onChange={(e) => setAndApply(e.target.value)} className={inputCls}>
        {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}