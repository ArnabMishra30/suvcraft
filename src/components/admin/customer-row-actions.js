'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CustomerRowActions({ row }) {
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
      const w = 192;
      const h = 200;
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

  async function setActive(v) {
    setMenu(false); setBusy(true);
    try {
      const res = await fetch(`/api/admin/customers/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: v }),
      });
      const json = await res.json();
      if (json.error) alert(json.message);
      router.refresh();
    } finally { setBusy(false); }
  }

  async function onDelete() {
    setMenu(false);
    if (!confirm(`Delete customer "${row.name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/customers/${row.id}`, { method: 'DELETE' });
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
          <Link href={`/admin/orders?q=${encodeURIComponent(row.name || row.id)}`} onClick={() => setMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <svg className="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            View Orders
          </Link>
          <Link href={`/admin/customers/transactions?userId=${row.id}`} onClick={() => setMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <svg className="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Transactions
          </Link>
          <button type="button" onClick={() => setActive(row.status ? 0 : 1)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            {row.status
              ? <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" /></svg>
              : <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            {row.status ? 'Deactivate' : 'Activate'}
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