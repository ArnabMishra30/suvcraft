'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300';

function Field({ label, required, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-2 sm:gap-6 items-start py-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <div className="sm:pt-2">
        <label className={labelCls}>{label} {required && <span className="text-red-500">*</span>}</label>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function NotificationSettingsForm({ initial }) {
  const router = useRouter();
  const [vapId, setVapId] = useState(initial?.vap_id_Key || '');
  const [projectId, setProjectId] = useState(initial?.firebase_project_id || '');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });
  const fileRef = useRef(null);

  function reset() {
    setVapId(initial?.vap_id_Key || '');
    setProjectId(initial?.firebase_project_id || '');
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
    setMsg({ kind: '', text: '' });
  }

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const fd = new FormData();
      fd.append('vap_id_key', vapId);
      fd.append('firebase_project_id', projectId);
      if (file) fd.append('service_account_file', file);
      const res = await fetch('/api/admin/settings/notifications', { method: 'PUT', body: fd });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Notification settings updated.' });
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  const existingFile = initial?.firebase_service_account_file || '';

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            Notification Settings
          </h2>
        </div>

        <div className="px-5">
          <Field label="Vap Id Key" required>
            <textarea rows={3} className={inputCls} value={vapId} onChange={(e) => setVapId(e.target.value)} placeholder="Enter Vap Id Key" />
          </Field>
          <Field label="Firebase Project ID" required>
            <input className={inputCls} value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Enter Firebase Project ID" />
          </Field>
          <Field label="Service Account File" required>
            <input ref={fileRef} type="file" accept=".json,application/json"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-slate-300 dark:file:border-slate-700 file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 file:font-medium hover:file:bg-slate-200 dark:hover:file:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950" />
            {existingFile ? (
              <p className="mt-2 text-xs text-emerald-600 inline-flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Current file: <a href={`/${existingFile}`} target="_blank" rel="noreferrer" className="underline">{existingFile.split('/').pop()}</a>
              </p>
            ) : (
              <p className="mt-2 text-xs text-red-600">No file uploaded yet</p>
            )}
            {file && <p className="mt-1 text-xs text-slate-500">Selected: {file.name} ({Math.round(file.size / 1024)} KB)</p>}
          </Field>
        </div>
      </div>

      <div className="sticky bottom-0 z-30 mt-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 flex items-center justify-end gap-2">
        {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
        <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="button" onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
          {busy ? 'Saving…' : 'Update'}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </>
  );
}