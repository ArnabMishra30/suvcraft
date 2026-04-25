'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReturnReasonFormModal from './return-reason-form-modal';

export function AddReturnReasonButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Return Reason
      </button>
      <ReturnReasonFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function ReturnReasonRowActions({ row }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete reason "${row.return_reason}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/return-reasons/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <>
      <div className="inline-flex items-center gap-1">
        <button type="button" onClick={() => setEditOpen(true)} title="Edit" className="p-1.5 rounded-md text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </button>
        <button type="button" onClick={onDelete} disabled={busy} title="Delete" className="p-1.5 rounded-md text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
        </button>
      </div>
      <ReturnReasonFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={row} />
    </>
  );
}