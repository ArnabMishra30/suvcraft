'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import { MediaPickerCard } from './media-picker';
import SearchableSelect from './searchable-select';

const SEND_TO = [
  { value: 'all', label: 'All Users' },
  { value: 'customer', label: 'Customers' },
  { value: 'seller', label: 'Sellers' },
  { value: 'delivery_boy', label: 'Delivery Boys' },
  { value: 'affiliate', label: 'Affiliates' },
];

const TYPES = [
  { value: '', label: 'Select Type' },
  { value: 'default', label: 'Default' },
  { value: 'category', label: 'Category' },
  { value: 'product', label: 'Product' },
];

export default function NotificationFormModal({ open, onClose, categories = [], products = [] }) {
  const router = useRouter();
  const [sendTo, setSendTo] = useState('all');
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [includeImage, setIncludeImage] = useState(true);
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setSendTo('all'); setType(''); setTitle(''); setMessage('');
    setIncludeImage(true); setImage(''); setCategoryId(''); setProductId('');
    setErr('');
  }, [open]);

  async function send() {
    if (!type) { setErr('Type is required.'); return; }
    if (!title.trim()) { setErr('Title is required.'); return; }
    if (!message.trim()) { setErr('Message is required.'); return; }
    if (type === 'category' && !categoryId) { setErr('Category is required.'); return; }
    if (type === 'product' && !productId) { setErr('Product is required.'); return; }
    if (includeImage && !image) { setErr('Image is required when "Include Image" is checked.'); return; }

    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          send_to: sendTo,
          type,
          title: title.trim(),
          message: message.trim(),
          image: includeImage ? image : '',
          category_id: type === 'category' ? Number(categoryId) : null,
          product_id: type === 'product' ? Number(productId) : null,
        }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Send failed.'); return; }
      onClose();
      router.refresh();
    } catch { setErr('Network error.'); }
    finally { setBusy(false); }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <Modal open={open} onClose={onClose} title="Send Notification" size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={send} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Sending…' : 'Submit'}</button>
      </>}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Send to <span className="text-red-500">*</span></label>
          <select value={sendTo} onChange={(e) => setSendTo(e.target.value)} className={inputCls}>
            {SEND_TO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Type <span className="text-red-500">*</span></label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {type === 'category' && (
          <div>
            <label className={labelCls}>Category <span className="text-red-500">*</span></label>
            <SearchableSelect value={categoryId} onChange={setCategoryId} options={categories} placeholder="Search Category…" />
          </div>
        )}
        {type === 'product' && (
          <div>
            <label className={labelCls}>Product <span className="text-red-500">*</span></label>
            <SearchableSelect value={productId} onChange={setProductId} options={products} placeholder="Search Product…" />
          </div>
        )}

        <div>
          <label className={labelCls}>Title <span className="text-red-500">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Title for notification" />
        </div>
        <div>
          <label className={labelCls}>Message <span className="text-red-500">*</span></label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className={inputCls} />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" checked={includeImage} onChange={(e) => setIncludeImage(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          Include Image
        </label>

        {includeImage && (
          <MediaPickerCard
            title="Image *"
            hint="Recommended square or 16:9 ratio."
            value={image}
            onChange={setImage}
            kind="image"
            multi={false}
          />
        )}

        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}