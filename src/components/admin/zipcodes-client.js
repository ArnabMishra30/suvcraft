'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/format';
import ZipcodeFormModal from './zipcode-form-modal';

export function AddZipcodeButton({ cities = [] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Zipcode
      </button>
      <ZipcodeFormModal open={open} onClose={() => setOpen(false)} cities={cities} />
    </>
  );
}

export function ZipcodesTable({ rows, cities = [], currency = 'INR' }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() => new Set());
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected zipcode${selected.size === 1 ? '' : 's'}?`)) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/zipcodes', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const json = await res.json();
      if (json.error) alert(json.message);
      else { setSelected(new Set()); router.refresh(); }
    } finally { setBusy(false); }
  }

  async function deleteOne(id, label) {
    if (!confirm(`Delete zipcode "${label}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/zipcodes/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <>
      <div className="px-5 pt-5">
        <button type="button" onClick={bulkDelete} disabled={!selected.size || busy}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-4 py-2 text-sm font-semibold border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-950/60 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
          Delete Selected Zipcodes{selected.size ? ` (${selected.size})` : ''}
        </button>
      </div>

      <div className="overflow-x-auto rounded-b-xl mt-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th data-col="select" className="px-5 py-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={toggleAll}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              </th>
              <th data-col="id" className="px-5 py-3 text-center">ID</th>
              <th data-col="zipcode" className="px-5 py-3">Zipcode</th>
              <th data-col="city_name" className="px-5 py-3">City Name</th>
              <th data-col="min_amount" className="px-5 py-3 text-right">Minimum Free Delivery Order Amount</th>
              <th data-col="charges" className="px-5 py-3 text-right">Delivery Charges</th>
              <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                <div className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                  No records available at the moment
                </div>
              </td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                <td data-col="select" className="px-5 py-3">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                </td>
                <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.id}</td>
                <td data-col="zipcode" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{r.zipcode}</td>
                <td data-col="city_name" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.city_name || '—'}</td>
                <td data-col="min_amount" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatCurrency(r.minimum_free_delivery_order_amount, currency)}</td>
                <td data-col="charges" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatCurrency(r.delivery_charges, currency)}</td>
                <td data-col="actions" className="px-5 py-3 text-center">
                  <div className="inline-flex items-center gap-1">
                    <button type="button" onClick={() => setEditing(r)} disabled={busy} title="Edit"
                      className="p-1.5 rounded-md text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 disabled:opacity-60">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button type="button" onClick={() => deleteOne(r.id, r.zipcode)} disabled={busy} title="Delete"
                      className="p-1.5 rounded-md text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ZipcodeFormModal open={!!editing} onClose={() => setEditing(null)} initial={editing} cities={cities} />
    </>
  );
}