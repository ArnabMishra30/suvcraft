'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

const SWATCH_TYPES = [
  { value: '0', label: 'Default' },
  { value: '1', label: 'Color' },
  { value: '2', label: 'Image' },
];

export default function AttributeValueFormModal({ open, onClose, initial, attributes = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [attrId, setAttrId] = useState('');
  const [value, setValue] = useState('');
  const [swatchType, setSwatchType] = useState('0');
  const [swatchValue, setSwatchValue] = useState('');
  const [filterable, setFilterable] = useState(true);
  const [status, setStatus] = useState('1');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setAttrId(initial?.attribute_id ? String(initial.attribute_id) : '');
    setValue(initial?.value || '');
    setSwatchType(String(initial?.swatche_type ?? 0));
    setSwatchValue(initial?.swatche_value || '');
    setFilterable(initial?.filterable !== 0);
    setStatus(String(initial?.status ?? 1));
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!attrId) { setErr('Attribute is required.'); return; }
    if (!value.trim()) { setErr('Value is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/attribute-values/${initial.id}` : '/api/admin/attribute-values';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attribute_id: Number(attrId),
          value: value.trim(),
          swatche_type: Number(swatchType),
          swatche_value: swatchValue || '',
          filterable: filterable ? 1 : 0,
          status: Number(status),
        }),
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
      title={isEdit ? 'Edit Attribute Value' : 'Add Attribute Value'}
      size="md"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update' : 'Add')}</button>
      </>}
    >
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Attribute <span className="text-red-500">*</span></label>
          <select value={attrId} onChange={(e) => setAttrId(e.target.value)} className={inputCls}>
            <option value="">Select attribute…</option>
            {attributes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.attribute_set_name ? `${a.attribute_set_name} › ` : ''}{a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Value <span className="text-red-500">*</span></label>
          <input value={value} onChange={(e) => setValue(e.target.value)} className={inputCls} placeholder="e.g. Red, Small, etc" />
          <p className="mt-1 text-xs text-slate-500">No commas allowed in values.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Swatch Type</label>
            <select value={swatchType} onChange={(e) => { setSwatchType(e.target.value); setSwatchValue(''); }} className={inputCls}>
              {SWATCH_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Swatch Value</label>
            {swatchType === '1' ? (
              <input type="color" value={swatchValue || '#000000'} onChange={(e) => setSwatchValue(e.target.value)} className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 cursor-pointer" />
            ) : swatchType === '2' ? (
              <input type="text" value={swatchValue} onChange={(e) => setSwatchValue(e.target.value)} className={inputCls} placeholder="image path" />
            ) : (
              <input disabled placeholder="—" className={`${inputCls} cursor-not-allowed bg-slate-50 dark:bg-slate-900`} />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input id="filterable" type="checkbox" checked={filterable} onChange={(e) => setFilterable(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor="filterable" className="text-sm text-slate-700 dark:text-slate-300">Filterable</label>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}