'use client';

import { useRef, useState } from 'react';

export default function SystemUpdaterForm() {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  function pick(f) {
    if (!f) { setFile(null); return; }
    if (!/\.zip$/i.test(f.name)) {
      setMsg({ kind: 'error', text: 'Only .zip files are accepted.' });
      return;
    }
    setFile(f);
    setMsg({ kind: '', text: '' });
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files?.[0];
    pick(f);
  }

  async function update() {
    if (!file) { setMsg({ kind: 'error', text: 'Please choose a .zip file first.' }); return; }
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/system-updater', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message }); return; }
      setMsg({ kind: 'success', text: json.message || 'Update package uploaded.' });
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 p-4 flex gap-3">
        <svg className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <div className="text-sm font-semibold text-rose-900 dark:text-rose-200">NOTE:</div>
          <ul className="mt-1 list-disc pl-5 text-sm text-rose-800 dark:text-rose-300 space-y-0.5">
            <li>Make sure you update system in sequence.</li>
            <li>Like if you have current version 1.0 and you want to update this version to 1.5 then you can&apos;t update it directly.</li>
            <li>You must have to update in sequence like first update version 1.2 then 1.3 and 1.4 so on.</li>
          </ul>
        </div>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex items-center justify-center min-h-[180px] rounded-xl border-2 border-dashed cursor-pointer transition ${
          dragging
            ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30'
        }`}
      >
        <div className="text-center">
          <svg className="w-10 h-10 mx-auto text-slate-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">Drag &amp; Drop System Update / Installable / Plugin&apos;s .zip file Here</div>
          {file && <div className="mt-1 text-xs text-slate-500">Selected: {file.name} ({Math.round(file.size / 1024)} KB)</div>}
        </div>
        <input ref={inputRef} type="file" accept=".zip,application/zip" className="hidden"
          onChange={(e) => pick(e.target.files?.[0])} />
      </div>

      {msg.text && (
        <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${
          msg.kind === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300'
        }`}>{msg.text}</div>
      )}

      <button type="button" onClick={update} disabled={busy || !file}
        className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
        {busy ? 'Uploading…' : 'Update'}
      </button>
    </>
  );
}