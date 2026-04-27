'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

const STARTS_OPTIONS = [
  { value: '', label: 'Select' },
  { value: '0', label: 'Today' },
  { value: '1', label: 'Tomorrow' },
  { value: '2', label: 'Third Day' },
  { value: '3', label: 'Fourth Day' },
  { value: '4', label: 'Fifth Day' },
  { value: '5', label: 'Sixth Day' },
  { value: '6', label: 'Seventh Day' },
];

function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
      }`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

export default function TimeSlotConfigForm({ initial, AddButton }) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(Number(initial?.is_time_slots_enabled) === 1);
  const [startsFrom, setStartsFrom] = useState(initial?.delivery_starts_from || '0');
  const [allowedDays, setAllowedDays] = useState(initial?.allowed_days || '7');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  function reset() {
    setEnabled(Number(initial?.is_time_slots_enabled) === 1);
    setStartsFrom(initial?.delivery_starts_from || '0');
    setAllowedDays(initial?.allowed_days || '7');
    setMsg({ kind: '', text: '' });
  }

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/time-slot-config', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_time_slots_enabled: enabled ? 1 : 0,
          delivery_starts_from: startsFrom,
          allowed_days: allowedDays,
        }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Settings saved.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          Time Slots Settings
        </h2>
        {AddButton}
      </div>

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-2 sm:gap-6 items-center">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Time Slots <span className="text-slate-400 text-xs">[ Enable / Disable ]</span></label>
          <Toggle checked={enabled} onChange={setEnabled} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-2 sm:gap-6 items-center">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Delivery Starts From? <span className="text-red-500">*</span></label>
          <select value={startsFrom} onChange={(e) => setStartsFrom(e.target.value)} className={inputCls}>
            {STARTS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-2 sm:gap-6 items-center">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">How many days you want to allow? <span className="text-red-500">*</span></label>
          <select value={allowedDays} onChange={(e) => setAllowedDays(e.target.value)} className={inputCls}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>{n}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
          <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button type="button" onClick={save} disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
            {busy ? 'Saving…' : 'Save Settings'}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}