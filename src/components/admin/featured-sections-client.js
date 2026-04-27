'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import FeaturedSectionFormModal from './featured-section-form-modal';
import { FEATURED_PRODUCT_TYPES } from '@/lib/featured-types';

export function ProductTypeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [val, setVal] = useState(params.get('productType') || '');

  useEffect(() => { setVal(params.get('productType') || ''); }, [params]);

  function setAndApply(v) {
    setVal(v);
    const sp = new URLSearchParams(params);
    if (v) sp.set('productType', v); else sp.delete('productType');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="max-w-md">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filter by Product Type</label>
      <select value={val} onChange={(e) => setAndApply(e.target.value)}
        className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">All Product Types</option>
        {FEATURED_PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
    </div>
  );
}

export function AddFeaturedSectionButton({ categories = [], products = [] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-4 py-2 text-sm font-semibold border border-sky-200 dark:border-sky-900">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Feature Section
      </button>
      <FeaturedSectionFormModal open={open} onClose={() => setOpen(false)} categories={categories} products={products} />
    </>
  );
}

export function FeaturedSectionRowActions({ row, categories = [], products = [] }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete featured section "${row.title}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/featured-sections/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <>
      <div className="inline-flex items-center gap-1">
        <button type="button" onClick={() => setEditOpen(true)} title="Edit"
          className="p-1.5 rounded-md text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button type="button" onClick={onDelete} disabled={busy} title="Delete"
          className="p-1.5 rounded-md text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
        </button>
      </div>
      <FeaturedSectionFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={row} categories={categories} products={products} />
    </>
  );
}