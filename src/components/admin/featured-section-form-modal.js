'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import MultiSearchableSelect from './multi-searchable-select';
import { MediaPickerCard } from './media-picker';
import { FEATURED_PRODUCT_TYPES, FEATURED_STYLES } from '@/lib/featured-types';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

function csvToIds(csv) {
  return String(csv || '').split(',').map((s) => s.trim()).filter(Boolean);
}

export default function FeaturedSectionFormModal({ open, onClose, initial, categories = [], products = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [v, setV] = useState({
    title: '', short_description: '', categories: [], style: '', product_type: '',
    product_ids: [], seo_page_title: '', seo_meta_description: '', seo_meta_keywords: '', seo_og_image: '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setV({
      title: initial?.title || '',
      short_description: initial?.short_description || '',
      categories: csvToIds(initial?.categories),
      style: initial?.style || '',
      product_type: initial?.product_type || '',
      product_ids: csvToIds(initial?.product_ids),
      seo_page_title: initial?.seo_page_title || '',
      seo_meta_description: initial?.seo_meta_description || '',
      seo_meta_keywords: initial?.seo_meta_keywords || '',
      seo_og_image: initial?.seo_og_image || '',
    });
    setErr('');
  }, [open, initial]);

  function set(k, val) { setV((prev) => ({ ...prev, [k]: val })); }

  async function save() {
    if (!v.title.trim()) { setErr('Title is required.'); return; }
    if (!v.short_description.trim()) { setErr('Short description is required.'); return; }
    if (!v.categories.length) { setErr('Select at least one category.'); return; }
    if (!v.style) { setErr('Style is required.'); return; }
    if (!v.product_type) { setErr('Product Type is required.'); return; }
    if (v.product_type === 'custom_products' && !v.product_ids.length) { setErr('Custom Products needs at least one product selected.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/featured-sections/${initial.id}` : '/api/admin/featured-sections';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: v.title.trim(),
          short_description: v.short_description.trim(),
          categories: v.categories.map(Number),
          style: v.style,
          product_type: v.product_type,
          product_ids: v.product_ids.map(Number),
          seo_page_title: v.seo_page_title,
          seo_meta_description: v.seo_meta_description,
          seo_meta_keywords: v.seo_meta_keywords,
          seo_og_image: v.seo_og_image,
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Feature Section' : 'Add Feature Section'} size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update Feature Section' : 'Add Feature Section')}</button>
      </>}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Title for section <span className="text-red-500">*</span></label>
          <input className={inputCls} value={v.title} onChange={(e) => set('title', e.target.value)} placeholder="Title" />
        </div>
        <div>
          <label className={labelCls}>Short description <span className="text-red-500">*</span></label>
          <input className={inputCls} value={v.short_description} onChange={(e) => set('short_description', e.target.value)} placeholder="Short description" />
        </div>
        <div>
          <label className={labelCls}>Select Categories <span className="text-red-500">*</span></label>
          <MultiSearchableSelect values={v.categories} onChange={(vals) => set('categories', vals)} options={categories} placeholder="Search Category…" />
        </div>
        <div>
          <label className={labelCls}>Style <span className="text-red-500">*</span></label>
          <select className={inputCls} value={v.style} onChange={(e) => set('style', e.target.value)}>
            <option value="">Select Style</option>
            {FEATURED_STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Product Types <span className="text-red-500">*</span></label>
          <select className={inputCls} value={v.product_type} onChange={(e) => set('product_type', e.target.value)}>
            <option value="">Select Types</option>
            {FEATURED_PRODUCT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        {v.product_type === 'custom_products' && (
          <div>
            <label className={labelCls}>Pick Products <span className="text-red-500">*</span></label>
            <MultiSearchableSelect values={v.product_ids} onChange={(vals) => set('product_ids', vals)} options={products} placeholder="Search Products…" />
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">SEO Configuration</div>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>SEO Page Title</label>
              <input className={inputCls} value={v.seo_page_title} onChange={(e) => set('seo_page_title', e.target.value)} placeholder="SEO Page title" />
            </div>
            <div>
              <label className={labelCls}>SEO Meta Description</label>
              <textarea rows={3} className={inputCls} value={v.seo_meta_description} onChange={(e) => set('seo_meta_description', e.target.value)} placeholder="SEO Meta Description" />
            </div>
            <div>
              <label className={labelCls}>SEO Meta Keywords</label>
              <input className={inputCls} value={v.seo_meta_keywords} onChange={(e) => set('seo_meta_keywords', e.target.value)} placeholder="SEO Meta Keywords" />
            </div>
            <MediaPickerCard
              title="SEO Open Graph Image"
              hint="Used when this section is shared on social media."
              value={v.seo_og_image}
              onChange={(val) => set('seo_og_image', val)}
              kind="image"
            />
          </div>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}