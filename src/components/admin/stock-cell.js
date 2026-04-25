'use client';

import { useState } from 'react';

export default function StockCell({ kind, id, initial, label }) {
  const [value, setValue] = useState(String(initial ?? 0));
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState('idle');

  async function save() {
    if (String(initial ?? 0) === String(value)) return;
    setBusy(true); setState('saving');
    try {
      const url = kind === 'product' ? `/api/admin/stock/product/${id}` : `/api/admin/stock/variant/${id}`;
      const res = await fetch(url, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Number(value) }),
      });
      const json = await res.json();
      if (json.error) { setState('error'); alert(json.message); return; }
      setState('saved');
      setTimeout(() => setState('idle'), 1500);
    } catch {
      setState('error');
    } finally { setBusy(false); }
  }

  const ringCls = state === 'saved'
    ? 'border-emerald-500 ring-emerald-500/20'
    : state === 'error'
      ? 'border-red-500 ring-red-500/20'
      : state === 'saving'
        ? 'border-amber-500 ring-amber-500/20'
        : 'border-slate-300 dark:border-slate-700';

  return (
    <div className="inline-flex items-center gap-2">
      {label && <span className="text-xs text-slate-500 dark:text-slate-400">{label}:</span>}
      <input type="number" min="0" step="1" value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
        disabled={busy}
        className={`w-20 rounded-md border ${ringCls} bg-white dark:bg-slate-950 px-2 py-1 text-sm tabular-nums text-right focus:outline-none focus:ring-2 disabled:opacity-60`} />
    </div>
  );
}