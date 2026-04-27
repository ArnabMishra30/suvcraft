'use client';

import { useState } from 'react';

export default function SmtpTestButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function test() {
    const to = prompt('Send a test email to:');
    if (!to || !to.trim()) return;
    setBusy(true); setResult(null);
    try {
      const res = await fetch('/api/admin/settings/smtp-test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: to.trim() }),
      });
      const json = await res.json();
      setResult(json);
    } catch {
      setResult({ error: true, message: 'Network error.' });
    } finally { setBusy(false); }
  }

  return (
    <>
      <button type="button" onClick={test} disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-4 py-2 text-sm font-medium disabled:opacity-60">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        {busy ? 'Sending…' : 'Test SMTP Settings'}
      </button>
      {result && (
        <p className={`mt-2 text-xs ${result.error ? 'text-red-600' : 'text-emerald-600'}`}>
          {result.message}
        </p>
      )}
    </>
  );
}