'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const NEXT_STATUS = [
  { value: 1, label: 'Approve', tone: 'text-sky-700 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-950/40' },
  { value: 2, label: 'Reject', tone: 'text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40' },
  { value: 3, label: 'Mark Pickedup', tone: 'text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40' },
  { value: 4, label: 'Mark Returned', tone: 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40' },
];

export default function ReturnRowActions({ id }) {
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
      const w = 192, h = 240;
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
      const res = await fetch(`/api/admin/return-requests/${id}`, {
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
    if (!confirm('Delete this return request?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/return-requests/${id}`, { method: 'DELETE' });
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
          {NEXT_STATUS.map((s) => (
            <button key={s.value} type="button" onClick={() => setStatus(s.value)} className={`w-full text-left px-3 py-1.5 text-sm ${s.tone}`}>
              {s.label}
            </button>
          ))}
          <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
          <button type="button" onClick={onDelete} className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">Delete</button>
        </div>
      )}
    </>
  );
}