'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

const SWATCH_TYPES = [
  { value: '0', label: 'Default' },
  { value: '1', label: 'Color' },
  { value: '2', label: 'Image' },
];

function emptyValue() {
  return { value: '', swatche_type: '0', swatche_value: '' };
}

export default function AttributeFormModal({ open, onClose, initial, attributeSets: initialSets = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [name, setName] = useState('');
  const [attrSetId, setAttrSetId] = useState('');
  const [values, setValues] = useState([emptyValue()]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [sets, setSets] = useState(initialSets);

  useEffect(() => { setSets(initialSets); }, [initialSets]);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || '');
    setAttrSetId(initial?.attribute_set_id ? String(initial.attribute_set_id) : '');
    setErr('');

    if (isEdit) {
      fetch(`/api/admin/attributes/${initial.id}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.error) return;
          const vs = (j.data?.values || []).map((v) => ({
            value: v.value || '',
            swatche_type: String(v.swatche_type ?? 0),
            swatche_value: v.swatche_value || '',
          }));
          setValues(vs.length ? vs : [emptyValue()]);
        })
        .catch(() => {});
    } else {
      setValues([emptyValue()]);
    }
  }, [open, initial, isEdit]);

  function addValue() { setValues((vs) => [...vs, emptyValue()]); }
  function removeValue(i) { setValues((vs) => vs.filter((_, idx) => idx !== i)); }
  function updateValue(i, patch) { setValues((vs) => vs.map((v, idx) => idx === i ? { ...v, ...patch } : v)); }

  async function refreshSets() {
    try {
      const res = await fetch('/api/admin/attribute-sets/list');
      const json = await res.json();
      if (!json.error) setSets(json.data?.rows || []);
    } catch {}
  }

  async function save() {
    if (!attrSetId) { setErr('Attribute set is required.'); return; }
    if (!name.trim()) { setErr('Attribute name is required.'); return; }
    const cleanedValues = values.filter((v) => v.value.trim());
    if (!cleanedValues.length) { setErr('At least one attribute value is required.'); return; }

    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/attributes/${initial.id}` : '/api/admin/attributes';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          attribute_set_id: Number(attrSetId),
          status: 1,
          values: cleanedValues.map((v) => ({
            value: v.value.trim(),
            swatche_type: Number(v.swatche_type),
            swatche_value: v.swatche_value || '',
          })),
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Attribute' : 'Add Attribute'}
      size="xl"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update Attribute' : 'Add Attribute')}</button>
      </>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-x-4 gap-y-1 items-center">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Attribute Set <span className="text-red-500">*</span></label>
          <SearchableSetDropdown
            value={attrSetId}
            onChange={setAttrSetId}
            options={sets}
            onCreated={(newId) => { refreshSets(); setAttrSetId(String(newId)); }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-x-4 gap-y-1 items-center">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Attribute Name <span className="text-red-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Attribute Name" className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-x-4 gap-y-2 items-start">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:pt-2">Attribute Values <span className="text-red-500">*</span></label>
          <div className="space-y-2">
            <button type="button" onClick={addValue} className="inline-flex items-center gap-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3 py-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Attribute Value
            </button>
            {values.map((v, i) => (
              <ValueRow key={i} value={v} onChange={(patch) => updateValue(i, patch)} onRemove={() => removeValue(i)} />
            ))}
          </div>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}

function ValueRow({ value, onChange, onRemove }) {
  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_10rem_8rem_2.5rem] gap-2 items-center">
      <input value={value.value} onChange={(e) => onChange({ value: e.target.value })} placeholder="Enter Attribute Value" className={inputCls} />
      <select value={value.swatche_type} onChange={(e) => onChange({ swatche_type: e.target.value, swatche_value: '' })} className={inputCls}>
        {SWATCH_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      {value.swatche_type === '1' ? (
        <input type="color" value={value.swatche_value || '#000000'} onChange={(e) => onChange({ swatche_value: e.target.value })} className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 cursor-pointer" />
      ) : value.swatche_type === '2' ? (
        <input type="text" value={value.swatche_value || ''} onChange={(e) => onChange({ swatche_value: e.target.value })} placeholder="image path" className={inputCls} />
      ) : (
        <span className="text-xs text-slate-400 text-center">—</span>
      )}
      <button type="button" onClick={onRemove} title="Remove" className="inline-flex items-center justify-center h-9 w-full rounded-md bg-red-600 hover:bg-red-500 text-white">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
      </button>
    </div>
  );
}

function SearchableSetDropdown({ value, onChange, options, onCreated }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => String(o.id) === String(value));
  const filtered = options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function quickAdd() {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/attribute-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), status: 1 }),
      });
      const json = await res.json();
      if (json.error) return;
      onCreated?.(json.data?.id);
      setNewName(''); setAdding(false); setOpen(false); setQuery('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="block w-full text-left rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        <span className={selected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
          {selected ? selected.name : 'Search attributes…'}
        </span>
        <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-y-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="p-2 sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search attributes…"
              className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {!adding ? (
            <button type="button" onClick={() => setAdding(true)} className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add New
            </button>
          ) : (
            <div className="p-2 flex gap-2 border-b border-slate-200 dark:border-slate-800">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); quickAdd(); } }}
                placeholder="New attribute set name"
                className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={quickAdd} disabled={busy || !newName.trim()} className="px-3 py-1.5 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? '…' : 'Add'}</button>
              <button type="button" onClick={() => { setAdding(false); setNewName(''); }} className="px-3 py-1.5 rounded-md text-sm border border-slate-300 dark:border-slate-700">Cancel</button>
            </div>
          )}
          {filtered.length === 0 && !adding && <div className="px-3 py-2 text-xs text-slate-500">No matches.</div>}
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => { onChange(String(o.id)); setOpen(false); setQuery(''); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                String(o.id) === String(value) ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {o.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}