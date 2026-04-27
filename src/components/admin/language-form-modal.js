'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

export default function LanguageFormModal({ open, onClose, initial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [native, setNative] = useState('');
  const [rtl, setRtl] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.language || '');
    setCode(initial?.code || '');
    setNative(initial?.native_language || '');
    setRtl(Number(initial?.is_rtl) === 1);
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!name.trim()) { setErr('Name is required.'); return; }
    if (!code.trim()) { setErr('Code is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/languages/${initial.id}` : '/api/admin/languages';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: name.trim(),
          code: code.trim(),
          native_language: native.trim(),
          is_rtl: rtl ? 1 : 0,
        }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      onClose();
      router.refresh();
    } catch { setErr('Network error.'); }
    finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Language' : 'Add Language'} size="md"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update' : 'Add Language')}</button>
      </>}>
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. English , Hindi" />
          <p className="mt-1 text-xs text-slate-500">(Language name should be in english)</p>
        </div>
        <div>
          <label className={labelCls}>Code</label>
          <input className={inputCls} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex. EN, हिन्दी" />
        </div>
        <div>
          <label className={labelCls}>Native Language</label>
          <input className={inputCls} value={native} onChange={(e) => setNative(e.target.value)} placeholder="Ex. English , हिन्दी" />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 pt-1">
          <input type="checkbox" checked={rtl} onChange={(e) => setRtl(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          Enable RTL
        </label>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}