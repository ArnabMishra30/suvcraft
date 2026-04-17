'use client';

import { useEffect, useRef, useState } from 'react';
import Modal from './modal';

const VIDEO_EXTS = new Set(['mp4', 'webm', 'ogg', 'mov']);

function formatBytes(b) {
  const n = Number(b || 0);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function MediaManagerModal({ open, onClose, kind = 'image', multi = false, onChoose }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const fileRef = useRef(null);

  async function load(p = page) {
    setLoading(true); setErr('');
    try {
      const url = `/api/admin/media?page=${p}&perPage=${perPage}&kind=${kind}${q ? `&q=${encodeURIComponent(q)}` : ''}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Load failed.'); return; }
      setRows(json.data.rows || []);
      setTotalPages(json.data.totalPages || 1);
    } catch {
      setErr('Network error.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    setSelected(new Set()); setQ(''); setPage(1); setInfo(''); setErr('');
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  async function uploadFiles(fileList) {
    const files = [...fileList].filter(Boolean);
    if (!files.length) return;
    setUploading(true); setErr('');
    let okCount = 0;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('kind', kind);
        const res = await fetch('/api/admin/uploads', { method: 'POST', body: fd });
        const json = await res.json();
        if (json.error) { setErr(json.message || 'Upload failed.'); break; }
        okCount += 1;
      } catch {
        setErr('Network error during upload.'); break;
      }
    }
    setUploading(false);
    if (okCount) {
      setInfo(`Uploaded ${okCount} file(s).`);
      setTimeout(() => setInfo(''), 3000);
      setPage(1); load(1);
    }
  }

  function onPickFiles(e) {
    uploadFiles(e.target.files || []);
    e.target.value = '';
  }

  function toggle(row) {
    if (multi) {
      setSelected((s) => {
        const next = new Set(s);
        if (next.has(row.id)) next.delete(row.id); else next.add(row.id);
        return next;
      });
    } else {
      setSelected(new Set([row.id]));
    }
  }

  function chooseSelected() {
    const picked = rows.filter((r) => selected.has(r.id));
    if (!picked.length) return;
    onChoose?.(multi ? picked : picked[0]);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Media"
      size="xl"
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button
            type="button"
            disabled={!selected.size}
            onClick={chooseSelected}
            className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            Choose Media{multi && selected.size ? ` (${selected.size})` : ''}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files); }}
          className={`rounded-lg border-2 border-dashed px-4 py-8 text-center text-sm transition ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300'
              : 'border-slate-300 dark:border-slate-700 text-slate-500'
          }`}
        >
          Drag &amp; Drop Media Files Here
        </div>

        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" multiple accept={kind === 'video' ? 'video/*' : 'image/*'} onChange={onPickFiles} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-3 py-1.5 disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
          {info && <span className="text-xs text-emerald-600 ml-2">{info}</span>}
        </div>

        <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
          Select media and click Choose Media
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 max-w-xs flex gap-2">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setPage(1); load(1); } }}
              placeholder="Search"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button type="button" onClick={() => { setPage(1); load(1); }} className="px-3 py-1.5 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white">Search</button>
          </div>
          <button type="button" onClick={() => load(page)} className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" title="Refresh">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5m2 9a8 8 0 01-14 5" /></svg>
          </button>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 w-10"></th>
                <th className="px-3 py-2">Image</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-500">Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-500">No media found.</td></tr>
              )}
              {!loading && rows.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => toggle(m)}
                  className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/50 ${selected.has(m.id) ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''}`}
                >
                  <td className="px-3 py-2">
                    <input type={multi ? 'checkbox' : 'radio'} checked={selected.has(m.id)} onChange={() => toggle(m)} onClick={(e) => e.stopPropagation()} className="rounded border-slate-300 text-indigo-600" />
                  </td>
                  <td className="px-3 py-2">
                    {VIDEO_EXTS.has(String(m.extension).toLowerCase())
                      ? <div className="w-12 h-12 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                      : <img src={m.url} alt="" className="w-12 h-12 rounded-md object-cover bg-slate-100 dark:bg-slate-800" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300 max-w-[20rem] truncate" title={m.title || m.name}>{m.title || `${m.name}.${m.extension}`}</td>
                  <td className="px-3 py-2 text-slate-500">{formatBytes(m.size)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>rows per page</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 disabled:opacity-40">‹</button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 disabled:opacity-40">›</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function MediaPickerCard({ title, hint, value = '', onChange, kind = 'image', multi = false, max = 10 }) {
  const [open, setOpen] = useState(false);

  const items = multi
    ? (value || '').split(',').map((s) => s.trim()).filter(Boolean)
    : value ? [value] : [];

  function srcOf(p) {
    if (!p) return '';
    return p.startsWith('http') || p.startsWith('/') ? p : `/${p.replace(/^\/?/, '')}`;
  }

  function onChose(picked) {
    const arr = Array.isArray(picked) ? picked : [picked];
    const paths = arr.map((p) => p.url || `/${p.path || ''}`).filter(Boolean);
    if (multi) {
      const merged = [...items, ...paths].slice(0, max);
      onChange?.(merged.join(','));
    } else {
      onChange?.(paths[0] || '');
    }
  }

  function removeAt(i) {
    if (multi) {
      const next = items.filter((_, idx) => idx !== i);
      onChange?.(next.join(','));
    } else {
      onChange?.('');
    }
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
            {hint && <p className="mt-0.5 text-xs text-slate-500 inline-flex items-center gap-1"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{hint}</p>}
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-1.5 shadow-sm"
          >
            {multi ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
            )}
            {multi ? 'Add Images' : 'Upload'}
          </button>
        </div>
        <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 min-h-[160px] flex items-center justify-center">
          {items.length === 0 ? (
            <div className="text-center">
              <svg className="w-8 h-8 mx-auto text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">No {multi ? 'gallery images' : 'image'} added yet</p>
              <p className="text-xs text-slate-500">Click &ldquo;{multi ? 'Add Images' : 'Upload'}&rdquo; button to upload</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 w-full">
              {items.map((p, i) => (
                <div key={p + i} className="relative group">
                  <img src={srcOf(p)} alt="" className="w-24 h-24 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    title="Remove"
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MediaManagerModal open={open} onClose={() => setOpen(false)} kind={kind} multi={multi} onChoose={onChose} />
    </>
  );
}