'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import DeliveryBoyFormModal from './delivery-boy-form-modal';

export function DeliveryBoyStatusFilter() {
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
    <div className="max-w-sm">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filter By Delivery Boy Status</label>
      <select value={value} onChange={(e) => change(e.target.value)} className={inputCls}>
        <option value="">All</option>
        <option value="1">Approved</option>
        <option value="0">Not Approved</option>
        <option value="7">Removed</option>
      </select>
    </div>
  );
}

export function AddDeliveryBoyButton({ cities }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Delivery Boy
      </button>
      <DeliveryBoyFormModal open={open} onClose={() => setOpen(false)} cities={cities} />
    </>
  );
}

export function DeliveryBoyRowActions({ row, cities }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [pos, setPos] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
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
      const w = 192, h = 220;
      const top = (r.bottom + h > window.innerHeight) ? r.top - h - 4 : r.bottom + 4;
      const left = Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w));
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
      const res = await fetch(`/api/admin/delivery-boys/${row.id}`, {
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
    if (!confirm(`Delete delivery boy "${row.name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/delivery-boys/${row.id}`, { method: 'DELETE' });
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
          <button type="button" onClick={() => { setMenu(false); setEditOpen(true); }} className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit
          </button>
          <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
          <button type="button" onClick={() => setStatus(1)} className="w-full text-left px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40">Approve</button>
          <button type="button" onClick={() => setStatus(0)} className="w-full text-left px-3 py-1.5 text-sm text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40">Not Approved</button>
          <button type="button" onClick={() => setStatus(7)} className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Remove</button>
          <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
          <button type="button" onClick={onDelete} className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">Delete</button>
        </div>
      )}
      <DeliveryBoyFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={row} cities={cities} />
    </>
  );
}