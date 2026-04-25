'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import { MediaPickerCard } from './media-picker';

export default function ReturnReasonFormModal({ open, onClose, initial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setReason(initial?.return_reason || '');
    setMessage(initial?.message || '');
    setImage(initial?.image || '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!reason.trim()) { setErr('Return reason is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/return-reasons/${initial.id}` : '/api/admin/return-reasons';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_reason: reason.trim(), message: message.trim(), image }),
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
      title={isEdit ? 'Edit Return Reason' : 'Add Return Reason'}
      size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update' : 'Add')}</button>
      </>}
    >
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Return Reason <span className="text-red-500">*</span></label>
          <input autoFocus value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} placeholder="e.g. Damaged in transit" />
        </div>
        <div>
          <label className={labelCls}>Message</label>
          <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={inputCls} placeholder="Description shown to customers" />
        </div>
        <MediaPickerCard title="Image" hint="Optional icon shown next to the reason" value={image} onChange={setImage} kind="image" multi={false} />
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}