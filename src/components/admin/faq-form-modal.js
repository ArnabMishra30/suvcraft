'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

export default function FaqFormModal({ open, onClose, initial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setQuestion(initial?.question || '');
    setAnswer(initial?.answer || '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!question.trim()) { setErr('Question is required.'); return; }
    if (!answer.trim()) { setErr('Answer is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/faqs/${initial.id}` : '/api/admin/faqs';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim(), answer: answer.trim() }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      onClose();
      router.refresh();
    } catch { setErr('Network error.'); }
    finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit FAQs' : 'Add FAQs'} size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update FAQ' : 'Add FAQ')}</button>
      </>}>
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Question <span className="text-red-500">*</span></label>
          <input className={inputCls} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Question" />
        </div>
        <div>
          <label className={labelCls}>Answer <span className="text-red-500">*</span></label>
          <textarea rows={5} className={inputCls} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer" />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}