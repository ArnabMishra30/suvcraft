'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SystemUserRowActions({ row, currentUserId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isSelf = Number(currentUserId) === Number(row.id);

  async function onDelete() {
    if (isSelf) return;
    if (!confirm(`Delete system user "${row.username}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/system-users/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <div className="inline-flex items-center gap-1">
      <Link href={`/admin/system-users/${row.id}/edit`} title="Edit"
        className="p-1.5 rounded-md text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      </Link>
      <button type="button" onClick={onDelete} disabled={busy || isSelf} title={isSelf ? "You can't delete yourself" : 'Delete'}
        className="p-1.5 rounded-md text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 disabled:opacity-40 disabled:cursor-not-allowed">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
      </button>
    </div>
  );
}