'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import { MediaPickerCard } from './media-picker';
import SearchableSelect from './searchable-select';
import RichTextEditor from './rich-text-editor';

export default function BlogFormModal({ open, onClose, initial, categories = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title || '');
    setCategoryId(initial?.category_id ? String(initial.category_id) : '');
    setImage(initial?.image || '');
    setDescription(initial?.description || '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!title.trim()) { setErr('Title is required.'); return; }
    if (!categoryId) { setErr('Category is required.'); return; }
    if (!image) { setErr('Main image is required.'); return; }
    if (!description || description === '<p></p>') { setErr('Description is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/blogs/${initial.id}` : '/api/admin/blogs';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category_id: Number(categoryId),
          image,
          description,
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit blog' : 'Add blog'} size="xl"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update blog' : 'Add blog')}</button>
      </>}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Title <span className="text-red-500">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Add Blog title" />
        </div>

        <div>
          <label className={labelCls}>Select Categories <span className="text-red-500">*</span></label>
          <SearchableSelect value={categoryId} onChange={setCategoryId} options={categories} placeholder="Search Blog Category…" />
        </div>

        <MediaPickerCard
          title="Main Image *"
          hint="Used as the cover image on the blog listing."
          value={image}
          onChange={setImage}
          kind="image"
          multi={false}
        />

        <div>
          <label className={labelCls}>Blog Description <span className="text-red-500">*</span></label>
          <RichTextEditor value={description} onChange={setDescription} minHeight={240} />
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}