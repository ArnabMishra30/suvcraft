'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchableSelect from './searchable-select';

export function ProductRatingFilter({ products }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get('productId') || '';

  function changeProduct(v) {
    const sp = new URLSearchParams(params);
    if (v) sp.set('productId', v); else sp.delete('productId');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="max-w-md">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filter By Product</label>
      <SearchableSelect value={value} onChange={changeProduct} options={products} placeholder="Search Products…" />
    </div>
  );
}

export function ProductRatingRowActions({ id }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onDelete() {
    if (!confirm('Delete this rating? This cannot be undone.')) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/admin/product-ratings/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Delete failed.'); return; }
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button type="button" onClick={onDelete} disabled={busy} title="Delete" className="p-1.5 rounded-md text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
      </button>
      {err && <span className="text-xs text-red-600 ml-1">{err}</span>}
    </div>
  );
}

export function StarRating({ value }) {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < full;
        const isHalf = i === full && half;
        return (
          <svg key={i} className={`w-3.5 h-3.5 ${isFull || isHalf ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      })}
      <span className="ml-1 text-xs text-slate-700 dark:text-slate-300 tabular-nums">{v.toFixed(1)}</span>
    </span>
  );
}