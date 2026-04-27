'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

function trimSec(t) { return String(t || '').slice(0, 5); }

export default function TimeSlotFormModal({ open, onClose, initial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [title, setTitle] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [lastOrderTime, setLastOrderTime] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title || '');
    setFromTime(trimSec(initial?.from_time));
    setToTime(trimSec(initial?.to_time));
    setLastOrderTime(trimSec(initial?.last_order_time));
    setStatus(initial?.status != null ? String(initial.status) : '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!title.trim()) { setErr('Title is required.'); return; }
    if (!fromTime || !toTime || !lastOrderTime) { setErr('From, To and Last Order time are required.'); return; }
    if (status === '') { setErr('Status is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/time-slots/${initial.id}` : '/api/admin/time-slots';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          from_time: fromTime,
          to_time: toTime,
          last_order_time: lastOrderTime,
          status: Number(status),
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Time Slot' : 'Add Time Slot'} size="md"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update' : 'Add Time Slot')}</button>
      </>}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Title</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Morning 9AM to 12PM" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>From Time</label>
            <input type="time" className={inputCls} value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>To Time</label>
            <input type="time" className={inputCls} value={toTime} onChange={(e) => setToTime(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Last Order Time</label>
          <input type="time" className={inputCls} value={lastOrderTime} onChange={(e) => setLastOrderTime(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Select</option>
            <option value="1">Active</option>
            <option value="0">Deactive</option>
          </select>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}