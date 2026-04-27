'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import { CUSTOM_NOTIFICATION_TYPES } from '@/lib/notification-types';

export default function CustomNotificationFormModal({ open, onClose, initial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(initial?.type || '');
    setTitle(initial?.title || '');
    setMessage(initial?.message || '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!type) { setErr('Type is required.'); return; }
    if (!title.trim()) { setErr('Title is required.'); return; }
    if (!message.trim()) { setErr('Message is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/custom-notifications/${initial.id}` : '/api/admin/custom-notifications';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title: title.trim(), message: message.trim() }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      onClose();
      router.refresh();
    } catch { setErr('Network error.'); }
    finally { setBusy(false); }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Custom Notification' : 'Add Custom Notification'} size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update' : 'Submit')}</button>
      </>}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Types <span className="text-red-500">*</span></label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            <option value="">Select Types</option>
            {CUSTOM_NOTIFICATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>title <span className="text-red-500">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Title for notification" />
        </div>
        <div>
          <label className={labelCls}>Message <span className="text-red-500">*</span></label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className={inputCls} />
          <p className="mt-1 text-xs text-slate-500">You can use placeholders like <code>{'{user.username}'}</code>, <code>{'{order.id}'}</code> — they&apos;ll be substituted when the notification is dispatched.</p>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}