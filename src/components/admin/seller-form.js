'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MediaPickerCard } from './media-picker';
import SellerCategoryCommissions, { DeliverableHowItWorks } from './seller-category-commissions';

const SECTIONS = [
  { id: 'info', label: 'Seller Information' },
  { id: 'comm', label: 'Commission & Delivery Settings' },
  { id: 'store', label: 'Store Details' },
  { id: 'other', label: 'Other Details' },
  { id: 'perms', label: 'Permissions' },
  { id: 'seo', label: 'SEO Configuration' },
];

const DELIVERABLE_TYPES = [
  { value: '1', label: 'All' },
  { value: '2', label: 'Included' },
  { value: '3', label: 'Excluded' },
];

export default function SellerForm({ initial, categories = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;

  const initialPerms = (() => {
    try { return JSON.parse(initial?.permissions || '{}'); } catch { return {}; }
  })();

  const [form, setForm] = useState({
    name: initial?.username || '',
    mobile: initial?.mobile || '',
    email: initial?.email || '',
    password: '',
    confirm_password: '',
    address: initial?.address || '',
    authorized_signature: initial?.authorized_signature || '',
    address_proof: initial?.address_proof || '',
    latitude: initial?.latitude || '',
    longitude: initial?.longitude || '',
    commission: initial?.commission != null ? String(initial.commission) : '0',
    deliverable_city_type: initial?.deliverable_city_type ? String(initial.deliverable_city_type) : '1',
    store_name: initial?.store_name || '',
    store_url: initial?.store_url || '',
    store_description: initial?.store_description || '',
    logo: initial?.logo || '',
    status: initial?.status != null ? String(initial.status) : '2',
    tax_name: initial?.tax_name || '',
    tax_number: initial?.tax_number || '',
    low_stock_limit: initial?.low_stock_limit != null ? String(initial.low_stock_limit) : '0',
    require_product_approval: !!initialPerms.require_product_approval,
    view_customer_details: !!initialPerms.view_customer_details,
    seo_page_title: initial?.seo_page_title || '',
    seo_meta_keywords: initial?.seo_meta_keywords || '',
    seo_meta_description: initial?.seo_meta_description || '',
    seo_og_image: initial?.seo_og_image || '',
    category_commissions: Array.isArray(initial?.category_commissions) ? initial.category_commissions : [],
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function toggle(k) { setForm((f) => ({ ...f, [k]: !f[k] })); }

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    if (!form.seo_og_image) {
      setErr('SEO Open Graph Image is required.');
      document.getElementById('seo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setBusy(true);
    try {
      const url = isEdit ? `/api/admin/sellers/${initial.id}` : '/api/admin/sellers';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      router.push('/admin/sellers');
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(false);
    }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelCls = 'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1';
  const req = <span className="text-red-500 ml-0.5">*</span>;

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-6">
      <aside className="hidden lg:block">
        <nav className="sticky top-4 space-y-1">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="block px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">{s.label}</a>
          ))}
        </nav>
      </aside>

      <div className="space-y-6">
        {err && <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">{err}</div>}

        <Card id="info" title="Seller Information" icon="user">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className={labelCls}>Name {req}</label><input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="Seller Name" /></div>
            <div><label className={labelCls}>Mobile {req}</label><input required value={form.mobile} onChange={(e) => set('mobile', e.target.value)} className={inputCls} placeholder="Enter Mobile" /></div>
            <div><label className={labelCls}>Email {req}</label><input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} placeholder="Seller Email" /></div>
            <div><label className={labelCls}>Password {isEdit ? '' : req}</label><input type="password" required={!isEdit} value={form.password} onChange={(e) => set('password', e.target.value)} className={inputCls} placeholder={isEdit ? 'Leave blank to keep existing' : 'Seller Password'} /></div>
            <div><label className={labelCls}>Confirm Password {isEdit ? '' : req}</label><input type="password" required={!isEdit} value={form.confirm_password} onChange={(e) => set('confirm_password', e.target.value)} className={inputCls} placeholder="Seller Confirm Password" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Address {req}</label><textarea required rows={2} value={form.address} onChange={(e) => set('address', e.target.value)} className={inputCls} /></div>
            <div className="sm:col-span-2">
              <MediaPickerCard title="Authorized Signature" hint="Recommended: 600 × 400 pixels" value={form.authorized_signature} onChange={(v) => set('authorized_signature', v)} kind="image" multi={false} />
            </div>
          </div>
        </Card>

        <Card id="comm" title="Commission & Delivery Settings" icon="commission">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls}>Commission (%)</label>
              <input type="number" step="0.01" min="0" value={form.commission} onChange={(e) => set('commission', e.target.value)} className={inputCls} placeholder="Enter Commission(%) to be given to the Super Admin on order item." />
              <p className="mt-1 text-xs text-slate-500">Commission(%) to be given to the Super Admin on order item globally.</p>
            </div>
            <div>
              <label className={labelCls}>Choose Categories &amp; Commission(%)</label>
              <SellerCategoryCommissions
                value={form.category_commissions}
                onChange={(v) => set('category_commissions', v)}
                categories={categories}
              />
              <p className="mt-1 text-xs text-slate-500">Commission(%) to be given to the Super Admin on order item by Category you select. If you do not set the commission beside category then it will get global commission, otherwise particular category commission will be considered.</p>
            </div>
            <div>
              <label className={labelCls}>
                Deliverable City Type
                <DeliverableHowItWorks />
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <select value={form.deliverable_city_type} onChange={(e) => set('deliverable_city_type', e.target.value)} className={inputCls}>
                {DELIVERABLE_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>
        </Card>

        <Card id="store" title="Store Details" icon="store">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className={labelCls}>Name {req}</label><input required value={form.store_name} onChange={(e) => set('store_name', e.target.value)} className={inputCls} placeholder="Store Name" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Store URL</label><input type="url" value={form.store_url} onChange={(e) => set('store_url', e.target.value)} className={inputCls} placeholder="https://example.com" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Description</label><textarea rows={3} value={form.store_description} onChange={(e) => set('store_description', e.target.value)} className={inputCls} placeholder="Store Description" /></div>
            <div className="sm:col-span-2">
              <MediaPickerCard title="Store Logo" hint="Recommended: 500 × 500 pixels" value={form.logo} onChange={(v) => set('logo', v)} kind="image" multi={false} />
            </div>
          </div>
        </Card>

        <Card id="other" title="Other Details" icon="info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Status {req}</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {[
                  { value: '0', label: 'Deactive', tone: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900' },
                  { value: '1', label: 'Approved', tone: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-900' },
                  { value: '2', label: 'Not-Approved', tone: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900' },
                ].map((opt) => (
                  <label key={opt.value} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm cursor-pointer ${form.status === opt.value ? opt.tone + ' ring-1 ring-current' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                    <input type="radio" name="status" value={opt.value} checked={form.status === opt.value} onChange={() => set('status', opt.value)} className="text-indigo-600" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2"><label className={labelCls}>Tax Name {req}</label><input value={form.tax_name} onChange={(e) => set('tax_name', e.target.value)} className={inputCls} placeholder="Tax Name" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Tax Number {req}</label><input value={form.tax_number} onChange={(e) => set('tax_number', e.target.value)} className={inputCls} placeholder="Tax Number" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Latitude</label><input value={form.latitude} onChange={(e) => set('latitude', e.target.value)} className={inputCls} placeholder="Latitude" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Longitude</label><input value={form.longitude} onChange={(e) => set('longitude', e.target.value)} className={inputCls} placeholder="Longitude" /></div>
            <div className="sm:col-span-2"><label className={labelCls}>Low Stock Limit</label><input type="number" min="0" value={form.low_stock_limit} onChange={(e) => set('low_stock_limit', e.target.value)} className={inputCls} placeholder="Product low stock limit" /><p className="mt-1 text-xs text-slate-500">Default limit if product-wise stock limit is not set.</p></div>
          </div>
        </Card>

        <Card id="perms" title="Permissions" icon="lock">
          <div className="space-y-3">
            <Toggle id="require_product_approval" label="Require Product's Approval?" checked={form.require_product_approval} onChange={() => toggle('require_product_approval')} />
            <Toggle id="view_customer_details" label="View Customer's Details?" checked={form.view_customer_details} onChange={() => toggle('view_customer_details')} />
          </div>
        </Card>

        <Card id="seo" title="SEO Configuration" icon="seo">
          <div className="grid grid-cols-1 gap-4">
            <div><label className={labelCls}>Name</label><input value={form.seo_page_title} onChange={(e) => set('seo_page_title', e.target.value)} className={inputCls} placeholder="SEO page title" /></div>
            <div><label className={labelCls}>SEO Meta Keywords</label><input value={form.seo_meta_keywords} onChange={(e) => set('seo_meta_keywords', e.target.value)} className={inputCls} placeholder="Enter SEO meta keywords (comma separated)" /></div>
            <div><label className={labelCls}>SEO Meta Description</label><textarea rows={3} value={form.seo_meta_description} onChange={(e) => set('seo_meta_description', e.target.value)} className={inputCls} placeholder="Enter a short SEO meta description for this page" /></div>
            <MediaPickerCard title="SEO Open Graph Image" hint="Recommended: 1200 × 630 pixels" value={form.seo_og_image} onChange={(v) => set('seo_og_image', v)} kind="image" multi={false} />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push('/admin/sellers')} className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button type="submit" disabled={busy} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update Seller' : 'Add Seller')}</button>
        </div>
      </div>
    </form>
  );
}

const ICONS = {
  user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  commission: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z',
  store: 'M4 7l1-2h14l1 2M3 7v13h18V7M3 7h18M9 11h6',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  seo: 'M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z',
};

function Card({ id, title, icon, children }) {
  return (
    <section id={id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <header className="px-5 py-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          {ICONS[icon] && <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon]} /></svg>}
          {title}
        </h2>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Toggle({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-3 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
      <span>{label}</span>
      <span className="relative inline-flex">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <span className="w-10 h-6 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-indigo-600 transition" />
        <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}