'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const METHODS = [
  {
    value: 'firebase',
    title: 'Firebase Authentication',
    subtitle: 'Use Google Firebase for secure authentication with multiple sign-in methods',
    icon: 'M3 21l3.547-12.421L12 4l5.453 4.579L21 21H3zM12 4v17',
  },
  {
    value: 'custom_sms',
    title: 'Custom SMS Gateway OTP based',
    subtitle: 'Use your custom SMS gateway for OTP-based authentication',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  },
];

function MethodCard({ method, checked, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left flex items-start gap-4 p-4 rounded-lg border transition ${
        checked
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}>
      <span className={`mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 ${
        checked ? 'border-indigo-600' : 'border-slate-400'
      }`}>
        {checked && <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-slate-900 dark:text-white">{method.title}</span>
        <span className="mt-0.5 block text-xs text-slate-500">{method.subtitle}</span>
      </span>
      <svg className={`w-5 h-5 ${checked ? 'text-indigo-500' : 'text-slate-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d={method.icon} />
      </svg>
    </button>
  );
}

export default function AuthenticationSettingsForm({ initial }) {
  const router = useRouter();
  const [method, setMethod] = useState(initial?.authentication_method || 'firebase');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  function reset() {
    setMethod(initial?.authentication_method || 'firebase');
    setMsg({ kind: '', text: '' });
  }

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/authentication', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authentication_method: method }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Authentication settings updated.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
          Authentication Settings
        </h2>
      </div>

      <div className="p-5 space-y-4">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Authentication Method</div>
        <div className="space-y-3">
          {METHODS.map((m) => (
            <MethodCard key={m.value} method={m} checked={method === m.value} onClick={() => setMethod(m.value)} />
          ))}
        </div>

        {method === 'firebase' && (
          <Link href="/admin/web-settings/firebase" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
            Please config firebase config here
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        )}
        {method === 'custom_sms' && (
          <Link href="/admin/settings/sms-gateway" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
            Please config SMS Gateway here
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
          <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button type="button" onClick={save} disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
            {busy ? 'Saving…' : 'Update Authentication Settings'}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}