'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductImage from './product-image';

export default function CategoryOrderList({ initial }) {
  const router = useRouter();
  const [items, setItems] = useState(initial.map((it, i) => ({ ...it, row_order: it.row_order ?? i })));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [dragId, setDragId] = useState(null);
  const dirty = useRef(false);

  useEffect(() => {
    setItems(initial.map((it, i) => ({ ...it, row_order: it.row_order ?? i })));
    dirty.current = false;
  }, [initial]);

  function move(fromIdx, toIdx) {
    if (fromIdx === toIdx || toIdx < 0 || toIdx >= items.length) return;
    const next = [...items];
    const [m] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, m);
    next.forEach((it, i) => { it.row_order = i; });
    setItems(next);
    dirty.current = true;
  }

  async function save() {
    setBusy(true); setMsg(null);
    try {
      const sorted = [...items].sort((a, b) => a.row_order - b.row_order).map((it, i) => ({ id: it.id, row_order: i }));
      const res = await fetch('/api/admin/categories/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: sorted }),
      });
      const json = await res.json();
      setMsg({ ok: !json.error, text: json.message });
      if (!json.error) {
        dirty.current = false;
        router.refresh();
      }
    } catch {
      setMsg({ ok: false, text: 'Network error.' });
    } finally {
      setBusy(false);
      setTimeout(() => setMsg(null), 3500);
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 w-16 text-center">No.</th>
              <th className="px-5 py-3 w-32">Order ID</th>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3 w-24 text-center">Image</th>
              <th className="px-5 py-3 w-24 text-center">Move</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {items.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">No categories yet.</td></tr>
            )}
            {items.map((it, idx) => (
              <tr
                key={it.id}
                draggable
                onDragStart={() => setDragId(it.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId == null) return;
                  const fromIdx = items.findIndex((x) => x.id === dragId);
                  move(fromIdx, idx);
                  setDragId(null);
                }}
                className={`${dragId === it.id ? 'opacity-50' : ''} hover:bg-slate-50 dark:hover:bg-slate-950/50 cursor-move`}
              >
                <td className="px-5 py-3 text-center">
                  <div className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                    {idx + 1}
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-700 dark:text-slate-300">
                  <span className="text-xs text-slate-500">Order:</span> <span className="font-medium tabular-nums">{it.row_order}</span>
                </td>
                <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{it.name}</td>
                <td className="px-5 py-3 text-center"><div className="inline-block"><ProductImage src={it.image} alt={it.name} /></div></td>
                <td className="px-5 py-3 text-center">
                  <div className="inline-flex flex-col gap-0.5">
                    <button type="button" onClick={() => move(idx, idx - 1)} disabled={idx === 0} title="Move up" className="p-1 rounded text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button type="button" onClick={() => move(idx, idx + 1)} disabled={idx === items.length - 1} title="Move down" className="p-1 rounded text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Drag rows to reorder, or use the up/down buttons. Click Save to persist.</p>
        <div className="flex items-center gap-3">
          {msg && (
            <span className={`text-sm font-medium ${msg.ok ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>
          )}
          <button
            type="button"
            onClick={save}
            disabled={busy || items.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {busy ? 'Saving…' : 'Save'}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}