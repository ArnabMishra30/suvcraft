'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import { CUSTOM_NOTIFICATION_TYPES } from '@/lib/notification-types';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

export function CustomSmsAddForm() {
  const router = useRouter();
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  function reset() { setType(''); setTitle(''); setMessage(''); setMsg({ kind: '', text: '' }); }

  async function save() {
    if (!type) { setMsg({ kind: 'error', text: 'Type is required.' }); return; }
    if (!title.trim()) { setMsg({ kind: 'error', text: 'Title is required.' }); return; }
    if (!message.trim()) { setMsg({ kind: 'error', text: 'Message is required.' }); return; }
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/custom-sms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title: title.trim(), message: message.trim() }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Custom SMS added.' });
      reset();
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Type <span className="text-red-500">*</span></label>
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
          <option value="">Select Type</option>
          {CUSTOM_NOTIFICATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className={labelCls}>Title <span className="text-red-500">*</span></label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Enter SMS Title" />
      </div>
      <div>
        <label className={labelCls}>Message <span className="text-red-500">*</span></label>
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className={inputCls} placeholder="Write SMS content here…" />
      </div>
      {msg.text && <div className={`text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</div>}
      <div className="flex items-center gap-2">
        <button type="button" onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-slate-700 hover:bg-slate-600 text-white">Reset</button>
        <button type="button" onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60">
          {busy ? 'Saving…' : 'Add Custom Message'}
        </button>
      </div>
    </div>
  );
}

export function CustomSmsEditButton({ row }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(row.type || '');
  const [title, setTitle] = useState(row.title || '');
  const [message, setMessage] = useState(row.message || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(row.type || ''); setTitle(row.title || ''); setMessage(row.message || ''); setErr('');
  }, [open, row]);

  async function save() {
    if (!type || !title.trim() || !message.trim()) { setErr('All fields are required.'); return; }
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/admin/custom-sms/${row.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, title: title.trim(), message: message.trim() }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      setOpen(false);
      router.refresh();
    } catch { setErr('Network error.'); }
    finally { setBusy(false); }
  }

  async function onDelete() {
    if (!confirm(`Delete custom SMS "${row.title}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/custom-sms/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) alert(json.message);
      else { setOpen(false); router.refresh(); }
    } finally { setBusy(false); }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} title="Edit"
        className="p-1.5 rounded-md text-white bg-indigo-600 hover:bg-indigo-500">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit Custom SMS" size="lg"
        footer={<>
          <button type="button" onClick={onDelete} className="mr-auto px-4 py-2 rounded-md text-sm border border-red-300 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">Delete</button>
          <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
          <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : 'Update'}</button>
        </>}>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <option value="">Select Type</option>
              {CUSTOM_NOTIFICATION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Title</label>
            <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Message</label>
            <textarea rows={6} className={inputCls} value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
        </div>
      </Modal>
    </>
  );
}