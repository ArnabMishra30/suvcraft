'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Modal from './modal';

export default function AffiliateRowActions({ id, name, value }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(value ? '1' : '0');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function openModal() {
    setVal(value ? '1' : '0');
    setErr('');
    setOpen(true);
  }

  async function save() {
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/admin/products/affiliate/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_in_affiliate: Number(val) }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
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
        onClick={openModal}
        title="Edit affiliate setting"
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        Edit
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Product Affiliate Setting"
        size="md"
        footer={<>
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
          <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button>
        </>}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
            <input value={name || ''} readOnly className={`${inputCls} cursor-not-allowed bg-slate-50 dark:bg-slate-900`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Is in Affiliate <span className="text-red-500">*</span></label>
            <select value={val} onChange={(e) => setVal(e.target.value)} className={inputCls}>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
        </div>
      </Modal>
    </>
  );
}