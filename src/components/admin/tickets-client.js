'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import TicketConversationModal from './ticket-conversation-modal';

export function TicketRowActions({ row }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [pos, setPos] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
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
      const w = 180; const h = 100;
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

  async function onDelete() {
    setMenu(false);
    if (!confirm(`Delete ticket #${row.id}?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/tickets/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <>
      <button ref={btnRef} type="button" onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }} disabled={busy} title="Actions"
        className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-60">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
      </button>
      {menu && pos && (
        <div ref={menuRef} style={{ position: 'fixed', top: pos.top, left: pos.left, width: 180 }}
          className="z-[200] rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1">
          <button type="button" onClick={() => { setMenu(false); setViewOpen(true); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <svg className="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            View / Reply
          </button>
          <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
          <button type="button" onClick={onDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
            Delete
          </button>
        </div>
      )}
      <TicketConversationModal open={viewOpen} onClose={() => setViewOpen(false)} ticketId={viewOpen ? row.id : null} />
    </>
  );
}