'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import SearchableSelect from './searchable-select';
import { MediaPickerCard } from './media-picker';

const BONUS_TYPES = [
  { value: 'percentage_per_order', label: 'Percentage per Order' },
  { value: 'fixed_per_order', label: 'Fixed per Order' },
];

export default function DeliveryBoyFormModal({ open, onClose, initial, cities = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', password: '', confirm_password: '',
    address: '', bonus_type: 'percentage_per_order', bonus: '0', city: '', area: '',
    driving_license: '', status: '0',
  });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm({
      name: initial?.username || '',
      mobile: initial?.mobile || '',
      email: initial?.email || '',
      password: '',
      confirm_password: '',
      address: initial?.address || '',
      bonus_type: initial?.bonus_type || 'percentage_per_order',
      bonus: initial?.bonus != null ? String(initial.bonus) : '0',
      city: initial?.city ? String(initial.city) : '',
      area: initial?.area ? String(initial.area) : '',
      driving_license: initial?.driving_license || '',
      status: initial?.status != null ? String(initial.status) : '0',
    });
    setErr(''); setShowPw(false); setShowCpw(false);
  }, [open, initial]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    if (!isEdit && form.password !== form.confirm_password) {
      setErr('Passwords do not match.');
      return;
    }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/delivery-boys/${initial.id}` : '/api/admin/delivery-boys';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
  const req = <span className="text-red-500 ml-0.5">*</span>;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Delivery Boy' : 'Add Delivery Boy'}
      size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update Delivery Boy' : 'Add Delivery Boy')}</button>
      </>}
    >
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Name {req}</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="Delivery Boy Name" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Mobile {req}</label>
            <input value={form.mobile} onChange={(e) => set('mobile', e.target.value)} className={inputCls} placeholder="Enter Mobile" />
          </div>
          <div>
            <label className={labelCls}>Email {req}</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} placeholder="Enter Email" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Password {isEdit ? '' : req}</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} className={`${inputCls} pr-10`} placeholder={isEdit ? 'Leave blank to keep existing' : 'Type Password here'} />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={showPw ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} /></svg>
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Confirm Password {isEdit ? '' : req}</label>
            <div className="relative">
              <input type={showCpw ? 'text' : 'password'} value={form.confirm_password} onChange={(e) => set('confirm_password', e.target.value)} className={`${inputCls} pr-10`} placeholder="Type Confirm Password here" />
              <button type="button" onClick={() => setShowCpw((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={showCpw ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59' : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'} /></svg>
              </button>
            </div>
          </div>
        </div>
        <div>
          <label className={labelCls}>Address {req}</label>
          <textarea rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} className={inputCls} placeholder="Enter Address" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Bonus Types {req}</label>
            <select value={form.bonus_type} onChange={(e) => set('bonus_type', e.target.value)} className={inputCls}>
              {BONUS_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Bonus</label>
            <input type="number" step="0.01" min="0" value={form.bonus} onChange={(e) => set('bonus', e.target.value)} className={inputCls} placeholder="Amount or %" />
          </div>
        </div>
        <div>
          <label className={labelCls}>City {req}</label>
          <SearchableSelect value={form.city} onChange={(v) => set('city', v)} options={cities} placeholder="Search City…" />
        </div>
        <MediaPickerCard
          title="Driving License *"
          hint="Add Driving License's front and back image (select multiple)"
          value={form.driving_license}
          onChange={(v) => set('driving_license', v)}
          kind="image"
          multi={true}
          max={2}
        />
        <div>
          <label className={labelCls}>Status {req}</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {[
              { value: '0', label: 'Not Approved', tone: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900' },
              { value: '1', label: 'Approved', tone: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900' },
            ].map((opt) => (
              <label key={opt.value} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm cursor-pointer ${form.status === opt.value ? opt.tone + ' ring-1 ring-current' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                <input type="radio" name="db-status" value={opt.value} checked={form.status === opt.value} onChange={() => set('status', opt.value)} className="text-indigo-600" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}