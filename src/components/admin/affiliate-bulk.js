'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Modal from './modal';

export default function AffiliateBulk({ ids = [] }) {
  const router = useRouter();
  const [selected, setSelected] = useState(new Set());
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { setSelected(new Set()); }, [ids.join(',')]);

  useEffect(() => {
    function onChange(e) {
      const t = e.target;
      if (!t || t.getAttribute?.('data-bulk') !== 'aff-row') return;
      const id = Number(t.value);
      setSelected((s) => {
        const next = new Set(s);
        if (t.checked) next.add(id); else next.delete(id);
        return next;
      });
    }
    document.addEventListener('change', onChange);
    return () => document.removeEventListener('change', onChange);
  }, []);

  async function submit() {
    if (!selected.size || value === '') return;
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/admin/products/affiliate/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected], is_in_affiliate: Number(value) }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Update failed.'); return; }
      setOpen(false);
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(false);
    }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

  return (
    <>
      <button
        type="button"
        onClick={() => { setValue(''); setErr(''); setOpen(true); }}
        disabled={!selected.size}
        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
          selected.size
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
            : 'bg-indigo-50 text-indigo-400 cursor-not-allowed dark:bg-indigo-950/30 dark:text-indigo-500/70'
        }`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        Bulk Affiliate Settings{selected.size ? ` (${selected.size})` : ''}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Bulk Affiliate Settings"
        size="md"
        footer={<>
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button type="button" disabled={busy || value === ''} onClick={submit} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : 'Update Affiliate Settings'}</button>
        </>}
      >
        <div className="space-y-3">
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 px-3 py-2 text-sm text-blue-800 dark:text-blue-200 inline-flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <strong>{selected.size}</strong> product(s) selected for bulk update.
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Is in Affiliate <span className="text-red-500">*</span></label>
            <select value={value} onChange={(e) => setValue(e.target.value)} className={inputCls}>
              <option value="">Select Status</option>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">This will update affiliate status for all selected products.</p>
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
        </div>
      </Modal>
    </>
  );
}