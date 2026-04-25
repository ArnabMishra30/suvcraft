'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function SellerStatusFilter() {
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
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filter By Seller Status</label>
      <select value={value} onChange={(e) => change(e.target.value)} className={inputCls}>
        <option value="">All</option>
        <option value="1">Approved</option>
        <option value="2">Not Approved</option>
        <option value="0">Disabled</option>
        <option value="7">Removed</option>
      </select>
    </div>
  );
}

export function UpdateCommissionButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/sellers/settle-commission', { method: 'POST' });
      const json = await res.json();
      alert(json.message || (json.error ? 'Failed.' : 'Done.'));
      router.refresh();
    } catch {
      alert('Network error.');
    } finally {
      setBusy(false); setOpen(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-4 py-2 text-sm font-medium">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Update Seller Commission
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center">
            <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Are You Sure!</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">You won&apos;t be able to revert this!</p>
            <div className="mt-5 flex gap-2 justify-center">
              <button type="button" onClick={confirm} disabled={busy} className="px-5 py-2 rounded-md text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-medium disabled:opacity-60">{busy ? 'Working…' : 'Yes, settle commission!'}</button>
              <button type="button" onClick={() => setOpen(false)} className="px-5 py-2 rounded-md text-sm bg-slate-400 hover:bg-slate-500 text-white font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SellerRowActions({ row }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [pos, setPos] = useState(null);
  const [busy, setBusy] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu) return;
    function onClick(e) {
      if (btnRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      setMenu(false);
    }
    function reposition() {
      const r = btnRef.current?.getBoundingClientRect();
      if (!r) return;
      const menuW = 176;
      const menuH = 220;
      const top = (r.bottom + menuH > window.innerHeight) ? r.top - menuH - 4 : r.bottom + 4;
      const left = Math.max(8, Math.min(window.innerWidth - menuW - 8, r.right - menuW));
      setPos({ top, left });
    }
    reposition();
    document.addEventListener('mousedown', onClick);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [menu]);

  async function setStatus(s) {
    setMenu(false); setBusy(true);
    try {
      const res = await fetch(`/api/admin/sellers/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: s }),
      });
      const json = await res.json();
      if (json.error) alert(json.message);
      router.refresh();
    } finally { setBusy(false); }
  }

  async function onDelete() {
    setMenu(false);
    if (!confirm(`Delete seller "${row.name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/sellers/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <>
      <button ref={btnRef} type="button" onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }} disabled={busy} title="Actions" className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-60">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </button>
      {menu && pos && (
        <div ref={menuRef} style={{ position: 'fixed', top: pos.top, left: pos.left, width: 192 }} className="z-[200] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1">
          <Link href={`/admin/sellers/${row.id}/edit`} onClick={() => setMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </Link>
          <Link href={`/admin/orders?sellerId=${row.id}`} onClick={() => setMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <svg className="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            View Orders
          </Link>
          <button type="button" onClick={() => setStatus(7)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9l-6 6-6-6 m12-6H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
            Remove Seller
          </button>
          <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
          <button type="button" onClick={onDelete} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
            Delete
          </button>
        </div>
      )}
    </>
  );
}