'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

export default function SystemRegistrationForm({ initial }) {
  const router = useRouter();
  const [web, setWeb] = useState(initial?.web_purchase_code || '');
  const [app, setApp] = useState(initial?.app_purchase_code || '');
  const [busy, setBusy] = useState(false);
  const [registered, setRegistered] = useState(!!(initial?.web_purchase_code || initial?.app_purchase_code));
  const [msg, setMsg] = useState({ kind: '', text: '' });

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/registration', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ web_purchase_code: web, app_purchase_code: app }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setRegistered(true);
      setMsg({ kind: 'success', text: 'Your system is successfully registered with us! Enjoy selling online!' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  function reset() { setWeb(initial?.web_purchase_code || ''); setApp(initial?.app_purchase_code || ''); setMsg({ kind: '', text: '' }); }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
          Purchase Code Validator
        </h2>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purchase Code for WEB <span className="text-red-500">*</span></label>
          <input className={inputCls} value={web} onChange={(e) => setWeb(e.target.value)} placeholder="Enter your WEB purchase code here" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purchase Code for APP <span className="text-red-500">*</span></label>
          <input className={inputCls} value={app} onChange={(e) => setApp(e.target.value)} placeholder="Enter your APP purchase code here" />
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button type="button" onClick={save} disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
            {busy ? 'Registering…' : 'Register Now'}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>

        {registered && msg.kind !== 'error' && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-3">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span className="text-sm font-medium">{msg.text || 'Your system is successfully registered with us! Enjoy selling online!'}</span>
          </div>
        )}
        {msg.kind === 'error' && (
          <div className="text-sm text-red-600">{msg.text}</div>
        )}
      </div>
    </div>
  );
}