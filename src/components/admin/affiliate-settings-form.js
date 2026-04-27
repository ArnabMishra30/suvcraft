'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchableSelect from './searchable-select';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

function FieldRow({ label, hint, required, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[20rem_1fr] gap-2 sm:gap-6 items-start py-3">
      <div className="sm:pt-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 inline-flex items-center gap-1">
          {label}
          {hint && (
            <span title={hint} className="text-slate-400 cursor-help">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
          )}
          {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Card({ title, icon, children, footer }) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
          {title}
        </h2>
      </div>
      <div className="px-5 py-2">{children}</div>
      {footer && <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">{footer}</div>}
    </section>
  );
}

export default function AffiliateSettingsForm({ initial, categories = [] }) {
  const router = useRouter();
  const [basic, setBasic] = useState({
    permanent_account_delete_days: initial?.permanent_account_delete_days ?? '',
    max_withdrawal_amount: initial?.max_withdrawal_amount ?? '',
    min_withdrawal_balance: initial?.min_withdrawal_balance ?? '',
  });
  const seedRows = Array.isArray(initial?.category_commissions) && initial.category_commissions.length
    ? initial.category_commissions.map((r) => ({ category_id: String(r.category_id), commission: String(r.commission ?? '') }))
    : [{ category_id: '', commission: '' }];
  const [rows, setRows] = useState(seedRows);
  const [busyB, setBusyB] = useState(false);
  const [busyC, setBusyC] = useState(false);
  const [msgB, setMsgB] = useState({ kind: '', text: '' });
  const [msgC, setMsgC] = useState({ kind: '', text: '' });

  function setBasicVal(k, v) { setBasic((prev) => ({ ...prev, [k]: v })); }
  function setRow(i, k, v) { setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [k]: v } : r)); }
  function addRow() { setRows((prev) => [...prev, { category_id: '', commission: '' }]); }
  function removeRow(i) { setRows((prev) => prev.length === 1 ? [{ category_id: '', commission: '' }] : prev.filter((_, idx) => idx !== i)); }

  async function saveBasic() {
    setBusyB(true); setMsgB({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/affiliate', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          permanent_account_delete_days: basic.permanent_account_delete_days || 0,
          max_withdrawal_amount: basic.max_withdrawal_amount || 0,
          min_withdrawal_balance: basic.min_withdrawal_balance || 0,
        }),
      });
      const json = await res.json();
      if (json.error) { setMsgB({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsgB({ kind: 'success', text: 'Affiliate settings updated.' });
      router.refresh();
    } catch { setMsgB({ kind: 'error', text: 'Network error.' }); }
    finally { setBusyB(false); }
  }

  function resetBasic() {
    setBasic({
      permanent_account_delete_days: initial?.permanent_account_delete_days ?? '',
      max_withdrawal_amount: initial?.max_withdrawal_amount ?? '',
      min_withdrawal_balance: initial?.min_withdrawal_balance ?? '',
    });
    setMsgB({ kind: '', text: '' });
  }

  async function saveCommissions() {
    setBusyC(true); setMsgC({ kind: '', text: '' });
    try {
      const list = rows
        .filter((r) => r.category_id)
        .map((r) => ({ category_id: Number(r.category_id), commission: Number(r.commission || 0) }));
      const res = await fetch('/api/admin/settings/affiliate', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_commissions: list }),
      });
      const json = await res.json();
      if (json.error) { setMsgC({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsgC({ kind: 'success', text: 'Commission map updated.' });
      router.refresh();
    } catch { setMsgC({ kind: 'error', text: 'Network error.' }); }
    finally { setBusyC(false); }
  }

  // Each row only offers categories not already chosen by another row.
  function availableFor(currentId) {
    const chosen = new Set(rows.map((r) => r.category_id).filter((v) => v && v !== currentId));
    return categories.filter((c) => !chosen.has(String(c.id)));
  }

  return (
    <div className="space-y-6">
      <Card
        title="Basic Settings"
        icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
        footer={<>
          {msgB.text && <span className={`mr-auto text-sm ${msgB.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msgB.text}</span>}
          <button type="button" onClick={resetBasic} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button type="button" onClick={saveBasic} disabled={busyB}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
            {busyB ? 'Saving…' : 'Update Affiliate Settings'}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </>}>
        <FieldRow label="Permanent Account Delete Days" required hint="Number of days after which a deleted affiliate's account is purged for good.">
          <input type="number" min="0" step="1" className={inputCls} value={basic.permanent_account_delete_days} onChange={(e) => setBasicVal('permanent_account_delete_days', e.target.value)} placeholder="Account Delete Days" />
        </FieldRow>
        <FieldRow label="Max Amount for Withdrawal Request" required hint="Cap on a single withdrawal an affiliate can request.">
          <input type="number" min="0" step="0.01" className={inputCls} value={basic.max_withdrawal_amount} onChange={(e) => setBasicVal('max_withdrawal_amount', e.target.value)} placeholder="Max Amount for Withdrawal Request" />
        </FieldRow>
        <FieldRow label="Min Balance for Withdrawal Request" required hint="Affiliate wallet must hold at least this much before they can request payout.">
          <input type="number" min="0" step="0.01" className={inputCls} value={basic.min_withdrawal_balance} onChange={(e) => setBasicVal('min_withdrawal_balance', e.target.value)} placeholder="Min Amount for Withdrawal Request" />
        </FieldRow>
      </Card>

      <Card
        title="Affiliate Commission (%)"
        icon="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"
        footer={<>
          {msgC.text && <span className={`mr-auto text-sm ${msgC.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msgC.text}</span>}
          <button type="button" onClick={saveCommissions} disabled={busyC}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
            {busyC ? 'Saving…' : 'Update Affiliate Commission'}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </>}>
        <div className="py-2 space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-center">
              <SearchableSelect value={r.category_id} onChange={(v) => setRow(i, 'category_id', v)} options={availableFor(r.category_id)} placeholder="Select Category…" />
              <input type="number" min="0" max="100" step="0.01" className={inputCls} value={r.commission} onChange={(e) => setRow(i, 'commission', e.target.value)} placeholder="Commission (%)" />
              <button type="button" onClick={() => removeRow(i)} title="Remove"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6m0-6l-6 6" />
                </svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={addRow}
            className="inline-flex items-center gap-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-3 py-1.5 text-sm font-medium border border-sky-200 dark:border-sky-900">
            More
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </Card>
    </div>
  );
}