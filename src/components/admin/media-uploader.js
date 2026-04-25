'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MediaUploader() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [errs, setErrs] = useState([]);

  async function uploadFiles(files) {
    if (!files?.length) return;
    setBusy(true);
    setErrs([]);
    setProgress({ done: 0, total: files.length });
    const errors = [];
    let done = 0;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
        const json = await res.json();
        if (json.error) errors.push(`${file.name}: ${json.message || 'failed'}`);
      } catch {
        errors.push(`${file.name}: network error`);
      }
      done += 1;
      setProgress({ done, total: files.length });
    }
    setErrs(errors);
    setBusy(false);
    router.refresh();
    if (inputRef.current) inputRef.current.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    uploadFiles(Array.from(e.dataTransfer.files || []));
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Uploaded Media Files</h2>
      </div>
      <div className="p-5 space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex items-center justify-center min-h-[160px] rounded-lg border-2 border-dashed cursor-pointer transition ${
            dragging
              ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/30'
          }`}
        >
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Drag &amp; Drop Media Files <span className="text-indigo-600 dark:text-indigo-400 font-medium">Here</span>
            </div>
            {busy && (
              <div className="mt-2 text-xs text-slate-500">
                Uploading {progress.done} of {progress.total}…
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" multiple onChange={(e) => uploadFiles(Array.from(e.target.files || []))} className="hidden" />
        </div>

        {errs.length > 0 && (
          <div role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-xs text-red-700 dark:text-red-300 space-y-0.5 max-h-32 overflow-y-auto">
            {errs.map((m, i) => <div key={i}>{m}</div>)}
          </div>
        )}

        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          {busy ? 'Uploading…' : 'Upload'}
        </button>
      </div>
    </div>
  );
}