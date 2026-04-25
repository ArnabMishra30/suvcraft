'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProductFaqFormModal from './product-faq-form-modal';
import SearchableSelect from './searchable-select';

export function AddProductFaqButton({ products }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Product FAQs
      </button>
      <ProductFaqFormModal open={open} onClose={() => setOpen(false)} products={products} />
    </>
  );
}

export function ProductFaqFilter({ products }) {
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

export function ProductFaqRowActions({ row, products }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onDelete() {
    if (!confirm('Delete this FAQ?')) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/admin/product-faqs/${row.id}`, { method: 'DELETE' });
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
    <>
      <div className="inline-flex items-center gap-1">
        <button type="button" onClick={() => setEditOpen(true)} title="Edit / Answer" className="p-1.5 rounded-md text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button type="button" onClick={onDelete} disabled={busy} title="Delete" className="p-1.5 rounded-md text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
        </button>
        {err && <span className="text-xs text-red-600 ml-1">{err}</span>}
      </div>
      <ProductFaqFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={row} products={products} />
    </>
  );
}