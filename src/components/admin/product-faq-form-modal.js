'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import SearchableSelect from './searchable-select';

export default function ProductFaqFormModal({ open, onClose, initial, products = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [productId, setProductId] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setProductId(initial?.product_id ? String(initial.product_id) : '');
    setQuestion(initial?.question || '');
    setAnswer(initial?.answer || '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!isEdit && !productId) { setErr('Product is required.'); return; }
    if (!question.trim()) { setErr('Question is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/product-faqs/${initial.id}` : '/api/admin/product-faqs';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: Number(productId), question: question.trim(), answer: answer.trim() }),
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
      title={isEdit ? 'Edit Product FAQ' : 'Add Product FAQ'}
      size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update' : 'Add')}</button>
      </>}
    >
      <div className="space-y-3">
        {!isEdit && (
          <div>
            <label className={labelCls}>Product <span className="text-red-500">*</span></label>
            <SearchableSelect
              value={productId}
              onChange={setProductId}
              options={products}
              placeholder="Search Products…"
            />
          </div>
        )}
        {isEdit && (
          <div>
            <label className={labelCls}>Product</label>
            <input value={initial?.product_name || `#${initial?.product_id}`} readOnly className={`${inputCls} cursor-not-allowed bg-slate-50 dark:bg-slate-900`} />
          </div>
        )}
        <div>
          <label className={labelCls}>Question <span className="text-red-500">*</span></label>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className={inputCls} placeholder="What would you like to know?" />
        </div>
        <div>
          <label className={labelCls}>Answer</label>
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} className={inputCls} placeholder="Your answer (optional — can be added later)" />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}