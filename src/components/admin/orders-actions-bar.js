'use client';

import { useState } from 'react';

const ACTIONS = [
  { kind: 'promo', label: 'Settle Promo Code Discount', tone: 'bg-indigo-600 hover:bg-indigo-500 text-white', icon: 'M9 14l6-6M9 9h.01M15 15h.01M5 7l14 0M5 7l0 10a2 2 0 002 2h10a2 2 0 002-2l0-10' },
  { kind: 'user_cashback', label: 'Settle User Cashback', tone: 'bg-sky-500 hover:bg-sky-400 text-white', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z' },
  { kind: 'referral_cashback', label: 'Settle Referral Cashback', tone: 'bg-slate-600 hover:bg-slate-500 text-white', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z' },
];

export default function OrdersActionsBar() {
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState(null);

  async function settle(kind, label) {
    setBusy(kind); setToast(null);
    try {
      const res = await fetch('/api/admin/orders/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
      });
      const json = await res.json();
      setToast({ ok: !json.error, msg: json.message || (json.error ? 'Failed' : `${label} done.`) });
    } catch {
      setToast({ ok: false, msg: 'Network error.' });
    } finally {
      setBusy('');
      setTimeout(() => setToast(null), 4000);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.kind}
            type="button"
            disabled={busy === a.kind}
            onClick={() => settle(a.kind, a.label)}
            title={a.label}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${a.tone}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
            </svg>
            {busy === a.kind ? 'Working…' : a.label}
          </button>
        ))}
      </div>
      {toast && (
        <div role="status" className={`mt-2 inline-block rounded-lg px-3 py-1.5 text-xs font-medium ${
          toast.ok
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
            : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}