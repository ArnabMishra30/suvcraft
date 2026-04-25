'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import SearchableSelect from './searchable-select';
import { MediaPickerCard } from './media-picker';

export default function CategoryFormModal({ open, onClose, initial, parents = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name: '', parent_id: '', image: '',
    seo_page_title: '', seo_meta_description: '', seo_meta_keywords: '', seo_og_image: '',
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErr('');
    if (isEdit) {
      setLoaded(false);
      fetch(`/api/admin/categories/${initial.id}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.error) { setErr(j.message); return; }
          setForm({
            name: j.data.name || '',
            parent_id: j.data.parent_id ? String(j.data.parent_id) : '',
            image: j.data.image || '',
            seo_page_title: j.data.seo_page_title || '',
            seo_meta_description: j.data.seo_meta_description || '',
            seo_meta_keywords: j.data.seo_meta_keywords || '',
            seo_og_image: j.data.seo_og_image || '',
          });
        })
        .finally(() => setLoaded(true));
    } else {
      setForm({ name: '', parent_id: '', image: '', seo_page_title: '', seo_meta_description: '', seo_meta_keywords: '', seo_og_image: '' });
      setLoaded(true);
    }
  }, [open, initial, isEdit]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.name.trim()) { setErr('Name is required.'); return; }
    if (!form.image.trim()) { setErr('Main image is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/categories/${initial.id}` : '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, parent_id: form.parent_id || 0 }),
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

  const filteredParents = parents.filter((p) => !isEdit || p.id !== initial?.id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'Add Category'}
      size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy || !loaded} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update Category' : 'Add Category')}</button>
      </>}
    >
      <div className="space-y-4">
        {!loaded ? (
          <div className="text-sm text-slate-500 py-4">Loading…</div>
        ) : (
          <>
            <div>
              <label className={labelCls}>Name <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="Category Name" />
            </div>
            <div>
              <label className={labelCls}>Category Parent</label>
              <SearchableSelect
                value={form.parent_id}
                onChange={(v) => set('parent_id', v)}
                options={filteredParents}
                placeholder="Select Parent"
              />
            </div>
            <MediaPickerCard
              title="Main Image *"
              hint="Recommended: 500 × 500 pixels"
              value={form.image}
              onChange={(v) => set('image', v)}
              kind="image"
              multi={false}
            />

            <div className="rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">SEO Configuration</h3>
            </div>

            <div>
              <label className={labelCls}>SEO Page Title</label>
              <input value={form.seo_page_title} onChange={(e) => set('seo_page_title', e.target.value)} className={inputCls} placeholder="SEO Page title" />
            </div>
            <div>
              <label className={labelCls}>SEO Meta Description</label>
              <textarea rows={3} value={form.seo_meta_description} onChange={(e) => set('seo_meta_description', e.target.value)} className={inputCls} placeholder="SEO Meta Description" />
            </div>
            <div>
              <label className={labelCls}>SEO Meta Keywords</label>
              <input value={form.seo_meta_keywords} onChange={(e) => set('seo_meta_keywords', e.target.value)} className={inputCls} placeholder="SEO Meta Keywords" />
            </div>
            <MediaPickerCard
              title="SEO Open Graph Image"
              hint="Recommended: 1200 × 630 pixels for social media"
              value={form.seo_og_image}
              onChange={(v) => set('seo_og_image', v)}
              kind="image"
              multi={false}
            />
            {err && <div className="text-sm text-red-600">{err}</div>}
          </>
        )}
      </div>
    </Modal>
  );
}