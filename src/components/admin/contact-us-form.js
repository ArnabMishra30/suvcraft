'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './rich-text-editor';

export default function ContactUsForm({ initial }) {
  const router = useRouter();
  const [html, setHtml] = useState(initial || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  function reset() { setHtml(initial || ''); setMsg({ kind: '', text: '' }); }

  async function save() {
    if (!html.trim() || html === '<p></p>') {
      setMsg({ kind: 'error', text: 'Content cannot be empty.' });
      return;
    }
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/contact-us', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Contact Us updated.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h7" /></svg>
            Contact Us
          </h2>
        </div>
        <div className="p-5">
          <RichTextEditor value={html} onChange={setHtml} minHeight={360} />
        </div>
      </div>

      <div className="sticky bottom-0 z-30 mt-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 flex items-center justify-end gap-2">
        {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
        <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="button" onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
          {busy ? 'Saving…' : 'Update Contact Us'}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </>
  );
}