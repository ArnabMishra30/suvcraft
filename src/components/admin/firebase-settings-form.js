'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

const FIELDS = [
  { key: 'apiKey', label: 'API Key' },
  { key: 'authDomain', label: 'authDomain' },
  { key: 'databaseURL', label: 'Database URL' },
  { key: 'projectId', label: 'Project ID' },
  { key: 'storageBucket', label: 'Storage Bucket' },
  { key: 'messagingSenderId', label: 'Messaging Sender ID' },
  { key: 'appId', label: 'App ID' },
  { key: 'measurementId', label: 'Measurement ID' },
];

function Field({ label, required, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-2 sm:gap-6 items-start py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <div className="sm:pt-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label} {required && <span className="text-red-500">*</span>}</label>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function FirebaseSettingsForm({ initial }) {
  const router = useRouter();
  const [v, setV] = useState(() => {
    const seed = {};
    for (const f of FIELDS) seed[f.key] = initial?.[f.key] || '';
    return seed;
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  function set(key, value) { setV((prev) => ({ ...prev, [key]: value })); }

  function reset() {
    const seed = {};
    for (const f of FIELDS) seed[f.key] = initial?.[f.key] || '';
    setV(seed);
    setMsg({ kind: '', text: '' });
  }

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/firebase', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Firebase settings updated.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21l3.547-12.421L12 4l5.453 4.579L21 21H3zM12 4v17" /></svg>
            Firebase Settings
          </h2>
        </div>
        <div className="px-5">
          {FIELDS.map((f) => (
            <Field key={f.key} label={f.label} required>
              <input className={inputCls} value={v[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} placeholder={f.key} />
            </Field>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 z-30 mt-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 flex items-center justify-end gap-2">
        {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
        <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="button" onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
          {busy ? 'Saving…' : 'Update Settings'}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </>
  );
}