'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

export default function TaxFormModal({ open, onClose, initial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [title, setTitle] = useState('');
  const [percentage, setPercentage] = useState('');
  const [status, setStatus] = useState('1');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title || '');
    setPercentage(initial?.percentage != null ? String(initial.percentage) : '');
    setStatus(String(initial?.status ?? 1));
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!title.trim()) { setErr('Title is required.'); return; }
    if (percentage === '' || isNaN(Number(percentage))) { setErr('Percentage is required and must be a number.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/taxes/${initial.id}` : '/api/admin/taxes';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), percentage, status: Number(status) }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      onClose();
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(false);
    }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelCls = 'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Tax' : 'Add Tax'}
      size="md"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update' : 'Add')}</button>
      </>}
    >
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Title <span className="text-red-500">*</span></label>
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. GST 18%" />
        </div>
        <div>
          <label className={labelCls}>Percentage <span className="text-red-500">*</span></label>
          <div className="relative">
            <input type="number" step="0.01" min="0" value={percentage} onChange={(e) => setPercentage(e.target.value)} className={`${inputCls} pr-8`} placeholder="18" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
          </div>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}