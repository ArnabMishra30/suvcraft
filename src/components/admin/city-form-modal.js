'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

export default function CityFormModal({ open, onClose, initial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [name, setName] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [charges, setCharges] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setName(initial?.name || '');
    setMinAmount(initial?.minimum_free_delivery_order_amount != null ? String(initial.minimum_free_delivery_order_amount) : '');
    setCharges(initial?.delivery_charges != null ? String(initial.delivery_charges) : '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!name.trim()) { setErr('City name is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/cities/${initial.id}` : '/api/admin/cities';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          minimum_free_delivery_order_amount: Number(minAmount || 0),
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit City' : 'Add City'} size="md"
      footer={<>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update City' : 'Add City')}</button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
      </>}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>City Name <span className="text-red-500">*</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="City Name" />
        </div>
        <div>
          <label className={labelCls}>Minimum Free Delivery Order Amount <span className="text-red-500">*</span></label>
          <input type="number" min="0" step="0.01" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className={inputCls} placeholder="Minimum Free Delivery Order Amount" />
        </div>
        <div>
          <label className={labelCls}>Delivery Charges <span className="text-red-500">*</span></label>
          <input type="number" min="0" step="0.01" value={charges} onChange={(e) => setCharges(e.target.value)} className={inputCls} placeholder="Delivery Charges" />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}