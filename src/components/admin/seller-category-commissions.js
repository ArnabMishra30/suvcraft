'use client';

import { useEffect, useState } from 'react';
import Modal from './modal';
import SearchableSelect from './searchable-select';

export default function SellerCategoryCommissions({ value = [], onChange, categories = [] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState([]);

  useEffect(() => {
    if (!open) return;
    setDraft(value.length ? value.map((v) => ({ category_id: String(v.category_id || ''), commission: String(v.commission ?? '') })) : [{ category_id: '', commission: '' }]);
  }, [open, value]);

  function addRow() { setDraft((d) => [...d, { category_id: '', commission: '' }]); }
  function removeRow(i) { setDraft((d) => d.filter((_, idx) => idx !== i)); }
  function updateRow(i, patch) { setDraft((d) => d.map((r, idx) => idx === i ? { ...r, ...patch } : r)); }

  function reset() { setDraft([{ category_id: '', commission: '' }]); }

  function save() {
    const cleaned = draft
      .filter((r) => r.category_id && r.commission !== '')
      .map((r) => ({ category_id: Number(r.category_id), commission: Number(r.commission) || 0 }));
    onChange?.(cleaned);
    setOpen(false);
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-4 py-2 text-sm font-medium">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        Manage{value.length > 0 ? ` (${value.length})` : ''}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Categories & Commission(%)"
        size="lg"
        footer={<>
          <button type="button" onClick={reset} className="px-5 py-2 rounded-md text-sm bg-amber-500 hover:bg-amber-400 text-white font-medium">Reset</button>
          <button type="button" onClick={save} className="px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium">Save</button>
          <button type="button" onClick={() => setOpen(false)} className="px-5 py-2 rounded-md text-sm bg-slate-400 hover:bg-slate-500 text-white font-medium">Close</button>
        </>}
      >
        <div className="space-y-3">
          {draft.map((row, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_10rem_2.5rem] gap-2 items-center">
              <SearchableSelect
                value={row.category_id}
                onChange={(v) => updateRow(i, { category_id: v })}
                options={categories}
                placeholder="Select Category…"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={row.commission}
                onChange={(e) => updateRow(i, { commission: e.target.value })}
                placeholder="Commission"
                className={inputCls}
              />
              <button type="button" onClick={() => removeRow(i)} title="Remove" className="inline-flex items-center justify-center w-9 h-9 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}

          <button type="button" onClick={addRow} className="inline-flex items-center gap-1 rounded-md bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 text-xs font-medium">
            More
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </Modal>
    </>
  );
}

export function DeliverableHowItWorks() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-500 ml-2">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        How it works
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="How Deliverable City Type Works"
        size="lg"
        footer={<button type="button" onClick={() => setOpen(false)} className="px-5 py-2 rounded-md text-sm bg-slate-500 hover:bg-slate-600 text-white font-medium">Close</button>}
      >
        <div className="space-y-4 text-sm">
          <div className="font-medium text-slate-900 dark:text-white">This setting controls which cities the seller can deliver to:</div>

          <Variant tone="emerald" icon="check" title="All">
            The seller can deliver to all available cities without restrictions.
          </Variant>
          <Variant tone="sky" icon="plus" title="Included">
            The seller can only deliver to the specific cities or city groups selected below. Customers in other cities cannot order from this seller.
          </Variant>
          <Variant tone="rose" icon="minus" title="Excluded">
            The seller can deliver to all cities except the ones selected below. Use this to restrict delivery to specific cities.
          </Variant>

          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-4 py-3 flex gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
            <div className="text-amber-900 dark:text-amber-200">
              <strong>Important:</strong> If you change the deliverability type from zipcode to city or city to zipcode in the system settings, you will need to manually update the delivery settings for all sellers. The system cannot automatically set everything to &quot;ALL&quot; after such changes.
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 px-4 py-3 flex gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            <div className="text-blue-900 dark:text-blue-200">
              <strong>Note:</strong> This is a seller-level setting that applies to all products from this seller.
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Variant({ tone, icon, title, children }) {
  const colors = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    sky: 'text-sky-600 dark:text-sky-400',
    rose: 'text-rose-600 dark:text-rose-400',
  }[tone] || 'text-slate-600';
  const path = icon === 'check' ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    : icon === 'plus' ? 'M12 8v4m0 0v4m0-4h4m-4 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z'
    : 'M18 12H6m15 0a9 9 0 11-18 0 9 9 0 0118 0z';
  return (
    <div>
      <div className={`flex items-center gap-2 font-medium ${colors}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>
        {title}
      </div>
      <p className="mt-1 ml-6 text-slate-600 dark:text-slate-400">{children}</p>
    </div>
  );
}