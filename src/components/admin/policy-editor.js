'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './rich-text-editor';

export default function PolicyEditor({ policy, contents }) {
  const router = useRouter();
  const [activeKey, setActiveKey] = useState(policy.docs[0].key);
  const [drafts, setDrafts] = useState(() => {
    const seed = {};
    for (const d of policy.docs) seed[d.key] = contents[d.key] || '';
    return seed;
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  function setHtml(html) { setDrafts((prev) => ({ ...prev, [activeKey]: html })); }

  function reset() {
    const seed = {};
    for (const d of policy.docs) seed[d.key] = contents[d.key] || '';
    setDrafts(seed);
    setMsg({ kind: '', text: '' });
  }

  async function save() {
    const html = drafts[activeKey];
    if (!html?.trim() || html === '<p></p>') {
      setMsg({ kind: 'error', text: 'Content cannot be empty.' });
      return;
    }
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/policies', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: activeKey, html }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Policy updated.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  const multi = policy.docs.length > 1;
  const activeDoc = policy.docs.find((d) => d.key === activeKey) || policy.docs[0];

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h7" /></svg>
            {policy.title}
          </h2>
          {multi && (
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-sm">
              {policy.docs.map((d) => (
                <button key={d.key} type="button" onClick={() => setActiveKey(d.key)}
                  className={`px-3 py-1.5 ${
                    activeKey === d.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}>{d.label}</button>
              ))}
            </div>
          )}
        </div>
        <div className="p-5">
          <RichTextEditor key={activeKey} value={drafts[activeKey] || ''} onChange={setHtml} minHeight={360} />
        </div>
      </div>

      <div className="sticky bottom-0 z-30 mt-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 flex items-center justify-end gap-2">
        {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
        <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="button" onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
          {busy ? 'Saving…' : `Update ${activeDoc.label}`}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </>
  );
}