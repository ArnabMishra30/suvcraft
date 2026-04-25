'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

export default function PaymentRequestEditModal({ open, onClose, initial }) {
  const router = useRouter();
  const [status, setStatus] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setStatus(initial?.status != null ? String(initial.status) : '0');
    setRemarks(initial?.remarks || '');
    setErr('');
  }, [open, initial]);

  async function save() {
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/admin/payment-requests/${initial.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: Number(status), remarks }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Update failed.'); return; }
      onClose();
      router.refresh();
    } catch { setErr('Network error.'); }
    finally { setBusy(false); }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <Modal open={open} onClose={onClose} title="Update Payment Request" size="md"
      footer={<>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : 'Update'}</button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
      </>}>
      <div className="space-y-4">
        {initial && (
          <dl className="grid grid-cols-2 gap-3 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
            <div><dt className="text-xs text-slate-500">User</dt><dd className="font-medium text-slate-900 dark:text-white">{initial.username || `User #${initial.user_id}`}</dd></div>
            <div><dt className="text-xs text-slate-500">Type</dt><dd className="text-slate-700 dark:text-slate-300 capitalize">{String(initial.payment_type || '').replace(/_/g, ' ')}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-slate-500">Payment Address</dt><dd className="text-slate-700 dark:text-slate-300 break-all">{initial.payment_address}</dd></div>
            <div><dt className="text-xs text-slate-500">Amount</dt><dd className="font-semibold text-slate-900 dark:text-white tabular-nums">{Number(initial.amount_requested || 0).toLocaleString()}</dd></div>
          </dl>
        )}

        <div>
          <label className={labelCls}>Status <span className="text-red-500">*</span></label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="0">Pending</option>
            <option value="1">Approved</option>
            <option value="2">Rejected</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Remarks</label>
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className={inputCls} placeholder="Add a note for the user…" />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}