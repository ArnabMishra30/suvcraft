'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import { MediaPickerCard } from './media-picker';

export default function BlogCategoryFormModal({ open, onClose, initial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [banner, setBanner] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || '');
    setImage(initial?.image || '');
    setBanner(initial?.banner || '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!name.trim()) { setErr('Name is required.'); return; }
    if (!image) { setErr('Main image is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/blog-categories/${initial.id}` : '/api/admin/blog-categories';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), image, banner }),
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Blog Category' : 'Add Blog Category'} size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update Blog Category' : 'Add Blog Category')}</button>
      </>}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Name <span className="text-red-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Category Name" />
        </div>

        <MediaPickerCard
          title="Main Image *"
          hint="Square ratio works best."
          value={image}
          onChange={setImage}
          kind="image"
          multi={false}
        />

        <MediaPickerCard
          title="Banner Image"
          hint="Optional — used at the top of the blog listing for this category."
          value={banner}
          onChange={setBanner}
          kind="image"
          multi={false}
        />

        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}