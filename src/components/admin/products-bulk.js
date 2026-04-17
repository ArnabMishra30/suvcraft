'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductsBulk({ ids = [] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setSelected(new Set());
  }, [ids.join(',')]);

  useEffect(() => {
    function onChange(e) {
      const t = e.target;
      if (!t || t.getAttribute?.('data-bulk') !== 'row') return;
      const id = Number(t.value);
      setSelected((s) => {
        const next = new Set(s);
        if (t.checked) next.add(id); else next.delete(id);
        return next;
      });
    }
    document.addEventListener('change', onChange);
    return () => document.removeEventListener('change', onChange);
  }, []);

  function selectAll(e) {
    const checked = e.target.checked;
    setSelected(checked ? new Set(ids) : new Set());
    document.querySelectorAll('input[data-bulk="row"]').forEach((cb) => { cb.checked = checked; });
  }

  async function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected product(s)? This cannot be undone.`)) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/admin/products/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      });
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
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={bulkDelete}
        disabled={!selected.size || busy}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
          selected.size
            ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60'
            : 'bg-red-50/50 text-red-400 cursor-not-allowed dark:bg-red-950/20 dark:text-red-500/60'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
        {busy ? 'Deleting…' : `Delete Selected${selected.size ? ` (${selected.size})` : ''}`}
      </button>

      <input
        id="bulk-select-all"
        type="checkbox"
        onChange={selectAll}
        className="hidden"
      />

      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}