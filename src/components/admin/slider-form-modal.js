'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import { MediaPickerCard } from './media-picker';
import SearchableSelect from './searchable-select';

const TYPES = [
  { value: '', label: 'Select Type' },
  { value: 'default', label: 'Default' },
  { value: 'categories', label: 'Category' },
  { value: 'products', label: 'Product' },
  { value: 'sliderurl', label: 'Slider URL' },
];

export default function SliderFormModal({ open, onClose, initial, categories = [], products = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [type, setType] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [productId, setProductId] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(initial?.type || '');
    setImage(initial?.image || '');
    setCategoryId(initial?.type === 'categories' && initial?.type_id ? String(initial.type_id) : '');
    setProductId(initial?.type === 'products' && initial?.type_id ? String(initial.type_id) : '');
    setLink(initial?.type === 'sliderurl' ? (initial?.link || '') : '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!type) { setErr('Type is required.'); return; }
    if (!image) { setErr('Slider image is required.'); return; }
    if (type === 'categories' && !categoryId) { setErr('Category is required.'); return; }
    if (type === 'products' && !productId) { setErr('Product is required.'); return; }
    if (type === 'sliderurl' && !link.trim()) { setErr('Slider URL is required.'); return; }

    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/sliders/${initial.id}` : '/api/admin/sliders';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          image,
          category_id: type === 'categories' ? Number(categoryId) : null,
          product_id: type === 'products' ? Number(productId) : null,
          link: type === 'sliderurl' ? link.trim() : '',
        }),
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Slider' : 'Add Slider'} size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update Slider' : 'Add Slider')}</button>
      </>}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Type <span className="text-red-500">*</span></label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {type === 'categories' && (
          <div>
            <label className={labelCls}>Category <span className="text-red-500">*</span></label>
            <SearchableSelect value={categoryId} onChange={setCategoryId} options={categories} placeholder="Search Category…" />
          </div>
        )}

        {type === 'products' && (
          <div>
            <label className={labelCls}>Product <span className="text-red-500">*</span></label>
            <SearchableSelect value={productId} onChange={setProductId} options={products} placeholder="Search Product…" />
          </div>
        )}

        {type === 'sliderurl' && (
          <div>
            <label className={labelCls}>Slider URL <span className="text-red-500">*</span></label>
            <input type="url" value={link} onChange={(e) => setLink(e.target.value)} className={inputCls} placeholder="https://example.com/landing-page" />
          </div>
        )}

        <MediaPickerCard
          title="Slider Image *"
          hint="Recommended ratio 16:5 — JPG, PNG, WebP."
          value={image}
          onChange={setImage}
          kind="image"
          multi={false}
        />

        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}