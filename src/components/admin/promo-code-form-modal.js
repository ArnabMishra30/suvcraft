'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';
import { MediaPickerCard } from './media-picker';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
      }`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function dateOnly(v) { return String(v || '').slice(0, 10); }

export default function PromoCodeFormModal({ open, onClose, initial }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [v, setV] = useState({
    promo_code: '', message: '', start_date: '', end_date: '',
    no_of_users: '', minimum_order_amount: '', discount: '',
    discount_type: '', max_discount_amount: '',
    repeat_usage: '', no_of_repeat_usage: '',
    image: '', status: '', is_cashback: 0, list_promocode: 0,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setV({
      promo_code: initial?.promo_code || '',
      message: initial?.message || '',
      start_date: dateOnly(initial?.start_date) || '',
      end_date: dateOnly(initial?.end_date) || '',
      no_of_users: initial?.no_of_users != null ? String(initial.no_of_users) : '',
      minimum_order_amount: initial?.minimum_order_amount != null ? String(initial.minimum_order_amount) : '',
      discount: initial?.discount != null ? String(initial.discount) : '',
      discount_type: initial?.discount_type || '',
      max_discount_amount: initial?.max_discount_amount != null ? String(initial.max_discount_amount) : '',
      repeat_usage: initial?.repeat_usage != null ? String(initial.repeat_usage) : '',
      no_of_repeat_usage: initial?.no_of_repeat_usage != null ? String(initial.no_of_repeat_usage) : '',
      image: initial?.image || '',
      status: initial?.status != null ? String(initial.status) : '',
      is_cashback: Number(initial?.is_cashback) || 0,
      list_promocode: Number(initial?.list_promocode) || 0,
    });
    setErr('');
  }, [open, initial]);

  function set(k, val) { setV((prev) => ({ ...prev, [k]: val })); }

  async function save() {
    if (!v.promo_code.trim()) { setErr('Promo code is required.'); return; }
    if (!v.start_date || !v.end_date) { setErr('Start and end dates are required.'); return; }
    if (!v.discount_type) { setErr('Discount type is required.'); return; }
    if (v.repeat_usage === '') { setErr('Repeat usage is required.'); return; }
    if (!v.image) { setErr('Main image is required.'); return; }
    if (v.status === '') { setErr('Status is required.'); return; }

    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/promo-codes/${initial.id}` : '/api/admin/promo-codes';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promo_code: v.promo_code.trim(),
          message: v.message.trim(),
          start_date: v.start_date,
          end_date: v.end_date,
          no_of_users: Number(v.no_of_users || 0),
          minimum_order_amount: Number(v.minimum_order_amount || 0),
          discount: Number(v.discount || 0),
          discount_type: v.discount_type,
          max_discount_amount: Number(v.max_discount_amount || 0),
          repeat_usage: Number(v.repeat_usage),
          no_of_repeat_usage: Number(v.no_of_repeat_usage || 0),
          image: v.image,
          status: Number(v.status),
          is_cashback: v.is_cashback ? 1 : 0,
          list_promocode: v.list_promocode ? 1 : 0,
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
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Promo Code' : 'Add Promo Code'} size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update Promo Code' : 'Add Promo Code')}</button>
      </>}>
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Promo Code <span className="text-red-500">*</span></label>
          <input className={inputCls} value={v.promo_code} onChange={(e) => set('promo_code', e.target.value)} placeholder="Promo code title" />
        </div>
        <div>
          <label className={labelCls}>Message <span className="text-red-500">*</span></label>
          <input className={inputCls} value={v.message} onChange={(e) => set('message', e.target.value)} placeholder="Promo code message" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Start Date <span className="text-red-500">*</span></label>
            <input type="date" className={inputCls} value={v.start_date} onChange={(e) => set('start_date', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>End Date <span className="text-red-500">*</span></label>
            <input type="date" className={inputCls} value={v.end_date} onChange={(e) => set('end_date', e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>No. of Users <span className="text-red-500">*</span></label>
          <input type="number" min="0" className={inputCls} value={v.no_of_users} onChange={(e) => set('no_of_users', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Minimum Order Amount <span className="text-red-500">*</span></label>
          <input type="number" min="0" step="0.01" className={inputCls} value={v.minimum_order_amount} onChange={(e) => set('minimum_order_amount', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Discount <span className="text-red-500">*</span></label>
          <input type="number" min="0" step="0.01" className={inputCls} value={v.discount} onChange={(e) => set('discount', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Discount Type <span className="text-red-500">*</span></label>
          <select className={inputCls} value={v.discount_type} onChange={(e) => set('discount_type', e.target.value)}>
            <option value="">Select</option>
            <option value="percentage">Percentage</option>
            <option value="amount">Amount</option>
          </select>
        </div>
        {v.discount_type === 'percentage' && (
          <div>
            <label className={labelCls}>Max Discount Amount</label>
            <input type="number" min="0" step="0.01" className={inputCls} value={v.max_discount_amount} onChange={(e) => set('max_discount_amount', e.target.value)} />
          </div>
        )}
        <div>
          <label className={labelCls}>Repeat Usage <span className="text-red-500">*</span></label>
          <select className={inputCls} value={v.repeat_usage} onChange={(e) => set('repeat_usage', e.target.value)}>
            <option value="">Select</option>
            <option value="1">Allowed</option>
            <option value="0">Not Allowed</option>
          </select>
        </div>
        {v.repeat_usage === '1' && (
          <div>
            <label className={labelCls}>No of Repeat Usage</label>
            <input type="number" min="0" className={inputCls} value={v.no_of_repeat_usage} onChange={(e) => set('no_of_repeat_usage', e.target.value)} />
          </div>
        )}

        <MediaPickerCard
          title="Main Image *"
          hint="Square image works best."
          value={v.image}
          onChange={(val) => set('image', val)}
          kind="image"
        />

        <div>
          <label className={labelCls}>Status <span className="text-red-500">*</span></label>
          <select className={inputCls} value={v.status} onChange={(e) => set('status', e.target.value)}>
            <option value="">Select</option>
            <option value="1">Active</option>
            <option value="0">Deactive</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-32">Is Cashback?</span>
          <Toggle checked={!!v.is_cashback} onChange={(b) => set('is_cashback', b ? 1 : 0)} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 w-32">List Promocode?</span>
          <Toggle checked={!!v.list_promocode} onChange={(b) => set('list_promocode', b ? 1 : 0)} />
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}