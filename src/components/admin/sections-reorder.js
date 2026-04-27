'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SectionsReorder({ sections }) {
  const router = useRouter();
  // Local row order; the visual order = the array order. Order ID == idx + 1.
  const [items, setItems] = useState(sections);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);

  // If the server-side `sections` prop changes (e.g. router.refresh after Save), resync.
  useEffect(() => { setItems(sections); }, [sections]);

  function moveByDrop(fromId, toId) {
    if (fromId == null || fromId === toId) return;
    setItems((prev) => {
      const from = prev.findIndex((s) => s.id === fromId);
      const to = prev.findIndex((s) => s.id === toId);
      if (from < 0 || to < 0) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  }

  function moveToIndex(id, targetIdx) {
    setItems((prev) => {
      const from = prev.findIndex((s) => s.id === id);
      if (from < 0) return prev;
      const clamped = Math.max(0, Math.min(prev.length - 1, targetIdx));
      if (from === clamped) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(clamped, 0, moved);
      return copy;
    });
  }

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/featured-sections/order', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: items.map((s) => s.id) }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Order saved.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto rounded-t-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 w-10"></th>
              <th className="px-5 py-3 w-24">No.</th>
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Title</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {items.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-500 text-sm">No featured sections yet.</td></tr>
            )}
            {items.map((s, i) => {
              const isDragging = dragId === s.id;
              const isOver = overId === s.id && dragId !== s.id;
              return (
                <tr key={s.id}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDragId(s.id); }}
                  onDragEnd={() => { setDragId(null); setOverId(null); }}
                  onDragEnter={() => setOverId(s.id)}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={(e) => { e.preventDefault(); moveByDrop(dragId, s.id); setDragId(null); setOverId(null); }}
                  className={`transition ${
                    isDragging ? 'opacity-40' : ''
                  } ${
                    isOver ? 'bg-indigo-50 dark:bg-indigo-950/30 ring-2 ring-inset ring-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-950/50'
                  }`}>
                  <td className="px-5 py-3 cursor-grab active:cursor-grabbing text-slate-400" title="Drag to reorder">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                      <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                    </svg>
                  </td>
                  <td className="px-5 py-3 text-slate-700 dark:text-slate-300 tabular-nums">{i + 1}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-slate-500 text-sm">Order:</span>
                      <input type="number" min="1" max={items.length} step="1"
                        value={i + 1}
                        onChange={(e) => moveToIndex(s.id, Number(e.target.value) - 1)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1 text-sm tabular-nums text-right focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{s.title}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">Drag a row by its grip, or type a new position in the Order field.</span>
        <div className="flex items-center gap-2">
          {msg.text && <span className={`text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
          <button type="button" onClick={save} disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
            {busy ? 'Saving…' : 'Save'}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}