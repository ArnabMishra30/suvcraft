'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import { PRODUCT_STATUS } from '@/lib/product-status';

export default function ProductRowActions({ id, status }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClick(e) { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function setStatus(newStatus) {
    setMenuOpen(false);
    if (Number(newStatus) === Number(status)) return;
    setBusy('status'); setErr('');
    try {
      const res = await fetch(`/api/admin/products/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Failed.'); return; }
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy('');
    }
  }

  async function onDelete() {
    if (!confirm('Delete this product?')) return;
    setBusy('del'); setErr('');
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Delete failed.'); return; }
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="inline-flex items-center gap-1">
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          disabled={busy === 'status'}
          title="Change status"
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-60"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1">
            {Object.entries(PRODUCT_STATUS).map(([val, info]) => (
              <button
                key={val}
                type="button"
                onClick={() => setStatus(val)}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                  Number(val) === Number(status) ? 'font-semibold text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {info.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <Link
        href={`/admin/products/${id}/edit`}
        title="Edit"
        className="p-1.5 rounded-md text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy === 'del'}
        title="Delete"
        className="p-1.5 rounded-md text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
      </button>
      {err && <span className="text-xs text-red-600 ml-1">{err}</span>}
    </div>
  );
}