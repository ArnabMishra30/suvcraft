'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import MultiSearchableSelect from './multi-searchable-select';

export default function CityGroupFormModal({ open, onClose, initial, cities = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [name, setName] = useState('');
  const [ids, setIds] = useState([]);
  const [charges, setCharges] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.group_name || '');
    setIds(Array.isArray(initial?.city_ids) ? initial.city_ids.map(String) : []);
    setCharges(initial?.delivery_charges != null ? String(initial.delivery_charges) : '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!name.trim()) { setErr('Name is required.'); return; }
    if (!ids.length) { setErr('Select at least one deliverable city.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/city-groups/${initial.id}` : '/api/admin/city-groups';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_name: name.trim(),
          city_ids: ids.map(Number),
          delivery_charges: Number(charges || 0),
        }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      onClose();
      router.refresh();
    } catch { setErr('Network error.'); }
    finally { setBusy(false); }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit City Group' : 'Add City Group'} size="md"
      footer={<>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update Cities Group' : 'Add Cities Group')}</button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
      </>}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Name <span className="text-red-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Name" />
        </div>
        <div>
          <label className={labelCls}>Deliverable Cities <span className="text-red-500">*</span></label>
          <MultiSearchableSelect values={ids} onChange={setIds} options={cities}
            placeholder="Search City…" getLabel={(c) => c.name} />
        </div>
        <div>
          <label className={labelCls}>Delivery Charges</label>
          <input type="number" min="0" step="0.01" value={charges} onChange={(e) => setCharges(e.target.value)} className={inputCls} placeholder="Delivery Charges" />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}