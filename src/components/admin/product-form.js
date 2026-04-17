'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import RichTextEditor from './rich-text-editor';
import { MediaPickerCard } from './media-picker';

const VIDEO_TYPES = [
  { value: '', label: 'None' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'vimeo', label: 'Vimeo' },
  { value: 'mp4', label: 'MP4 URL' },
];

const INDICATORS = [
  { value: '', label: 'None' },
  { value: '1', label: 'Veg' },
  { value: '2', label: 'Non-Veg' },
];

const DELIVERABLE_TYPES = [
  { value: '1', label: 'All' },
  { value: '2', label: 'Include selected cities' },
  { value: '3', label: 'Exclude selected cities' },
];

export default function ProductForm({ sellers = [], brands = [], taxes = [], countries = [], pickupLocations = [], categories = [] }) {
  const router = useRouter();
  const [tab, setTab] = useState('general');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    // basic
    name: '',
    seller_id: '',
    type: 'simple_product',
    short_description: '',
    // details
    tax: '0',
    indicator: '',
    made_in: '',
    brand: '',
    total_allowed_quantity: '',
    minimum_order_quantity: '1',
    quantity_step_size: '1',
    warranty_period: '',
    guarantee_period: '',
    hsn_code: '',
    tags: '',
    // settings
    cod_allowed: true,
    is_returnable: false,
    is_cancelable: false,
    is_prices_inclusive_tax: false,
    is_attachment_required: false,
    is_in_affiliate: false,
    // categories
    category_id: '',
    // media
    image: '',
    other_images: '',
    video_type: '',
    video: '',
    // shipping
    deliverable_city_type: '1',
    deliverable_cities: '',
    low_stock_limit: '0',
    pickup_location: '',
    // description
    description: '',
    extra_description: '',
    // seo
    seo_page_title: '',
    seo_meta_keywords: '',
    seo_meta_description: '',
    seo_og_image: '',
  });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function toggle(k) { setForm((f) => ({ ...f, [k]: !f[k] })); }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      router.push('/admin/products');
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(false);
    }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelCls = 'block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1';
  const requiredMark = <span className="text-red-500 ml-0.5">*</span>;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {err && (
        <div role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Basic Information" icon="info">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className={labelCls}>Product Name {requiredMark}</label>
                <input id="name" required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="Enter product name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="seller_id" className={labelCls}>Select a seller {requiredMark}</label>
                  <select id="seller_id" required value={form.seller_id} onChange={(e) => set('seller_id', e.target.value)} className={inputCls}>
                    <option value="">Search Seller…</option>
                    {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="type" className={labelCls}>Product Type</label>
                  <select id="type" value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
                    <option value="simple_product">Physical Product</option>
                    <option value="digital_product">Digital Product</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Short Description {requiredMark}</label>
                <RichTextEditor value={form.short_description} onChange={(v) => set('short_description', v)} minHeight={140} />
              </div>
            </div>
          </Card>

          <Card title="Product Details" icon="details">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tax" className={labelCls}>Select a tax</label>
                <select id="tax" value={form.tax} onChange={(e) => set('tax', e.target.value)} className={inputCls}>
                  <option value="0">None</option>
                  {taxes.map((t) => <option key={t.id} value={t.id}>{t.title} ({t.percentage}%)</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="indicator" className={labelCls}>Select an indicator</label>
                <select id="indicator" value={form.indicator} onChange={(e) => set('indicator', e.target.value)} className={inputCls}>
                  {INDICATORS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="made_in" className={labelCls}>Made in Country</label>
                <select id="made_in" value={form.made_in} onChange={(e) => set('made_in', e.target.value)} className={inputCls}>
                  <option value="">Search country…</option>
                  {countries.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="brand" className={labelCls}>Brand</label>
                <select id="brand" value={form.brand} onChange={(e) => set('brand', e.target.value)} className={inputCls}>
                  <option value="">Search Brand…</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="total_allowed_quantity" className={labelCls}>Total Allowed Quantity</label>
                <input id="total_allowed_quantity" type="number" min="0" value={form.total_allowed_quantity} onChange={(e) => set('total_allowed_quantity', e.target.value)} className={inputCls} placeholder="Total Allowed Quantity" />
              </div>
              <div>
                <label htmlFor="minimum_order_quantity" className={labelCls}>Minimum Order Quantity</label>
                <input id="minimum_order_quantity" type="number" min="1" value={form.minimum_order_quantity} onChange={(e) => set('minimum_order_quantity', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="quantity_step_size" className={labelCls}>Quantity Step Size</label>
                <input id="quantity_step_size" type="number" min="1" value={form.quantity_step_size} onChange={(e) => set('quantity_step_size', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label htmlFor="warranty_period" className={labelCls}>Warranty Period</label>
                <input id="warranty_period" value={form.warranty_period} onChange={(e) => set('warranty_period', e.target.value)} className={inputCls} placeholder="e.g. 1 Year" />
              </div>
              <div>
                <label htmlFor="guarantee_period" className={labelCls}>Guarantee Period</label>
                <input id="guarantee_period" value={form.guarantee_period} onChange={(e) => set('guarantee_period', e.target.value)} className={inputCls} placeholder="e.g. 6 Months" />
              </div>
              <div>
                <label htmlFor="hsn_code" className={labelCls}>HSN Code</label>
                <input id="hsn_code" value={form.hsn_code} onChange={(e) => set('hsn_code', e.target.value)} className={inputCls} placeholder="HSN Code" />
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="tags" className={labelCls}>Product Tags</label>
                <input id="tags" value={form.tags} onChange={(e) => set('tags', e.target.value)} className={inputCls} placeholder="e.g. Cotton, Smartphone, etc" />
                <p className="mt-1 text-xs text-slate-500">These tags help in search results.</p>
              </div>
            </div>
          </Card>

          <Card title="Product Media" icon="media">
            <div className="space-y-6">
              <MediaPickerCard
                title={<>Main Image <span className="text-red-500">*</span></>}
                hint="Recommended: 180 × 180 pixels"
                value={form.image}
                onChange={(v) => set('image', v)}
                kind="image"
                multi={false}
              />
              <MediaPickerCard
                title="Product Gallery"
                hint="Recommended: 500 × 500 pixels, Max 10 images"
                value={form.other_images}
                onChange={(v) => set('other_images', v)}
                kind="image"
                multi={true}
                max={10}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="video_type" className={labelCls}>Video Type</label>
                  <select id="video_type" value={form.video_type} onChange={(e) => set('video_type', e.target.value)} className={inputCls}>
                    {VIDEO_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="video" className={labelCls}>Video URL/ID</label>
                  <input id="video" value={form.video} onChange={(e) => set('video', e.target.value)} className={inputCls} placeholder="optional" />
                </div>
              </div>
            </div>
          </Card>

          <Card title="">
            <div className="border-b border-slate-200 dark:border-slate-800 -mx-5 -mt-5 px-5">
              <nav className="flex gap-4">
                <button type="button" onClick={() => setTab('general')} className={`py-3 text-sm font-medium border-b-2 ${tab === 'general' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>General</button>
                <button type="button" onClick={() => setTab('attributes')} className={`py-3 text-sm font-medium border-b-2 ${tab === 'attributes' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Attributes</button>
              </nav>
            </div>

            {tab === 'general' && (
              <div className="pt-5">
                <p className="text-xs text-slate-500 mb-2">Variants UI will live here in a future iteration. For now this product is created as a simple product — the form below is a placeholder.</p>
                <div>
                  <label htmlFor="type-of-product" className={labelCls}>Type of Product</label>
                  <select id="type-of-product" value={form.type} onChange={(e) => set('type', e.target.value)} className={inputCls}>
                    <option value="simple_product">Simple product</option>
                    <option value="variable_product" disabled>Variable product (coming soon)</option>
                  </select>
                </div>
              </div>
            )}

            {tab === 'attributes' && (
              <div className="pt-5 text-sm text-slate-500">Attributes / variants editor — coming soon.</div>
            )}
          </Card>

          <Card title="Product Description" icon="desc">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Description {requiredMark}</label>
                <RichTextEditor value={form.description} onChange={(v) => set('description', v)} minHeight={240} />
              </div>
              <div>
                <label className={labelCls}>Extra Description</label>
                <RichTextEditor value={form.extra_description} onChange={(v) => set('extra_description', v)} minHeight={240} />
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Categories" icon="cat">
            {!form.seller_id ? (
              <p className="text-sm text-slate-500">No categories selected. Pick a seller first; then choose a category below.</p>
            ) : (
              <select required value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className={inputCls}>
                <option value="">Select category…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </Card>

          <Card title="Product Settings" icon="settings">
            <div className="space-y-3">
              <Toggle id="cod_allowed" label="COD Allowed" checked={form.cod_allowed} onChange={() => toggle('cod_allowed')} />
              <Toggle id="is_returnable" label="Returnable" checked={form.is_returnable} onChange={() => toggle('is_returnable')} />
              <Toggle id="is_cancelable" label="Cancelable" checked={form.is_cancelable} onChange={() => toggle('is_cancelable')} />
              <Toggle id="is_prices_inclusive_tax" label="Tax Included In Prices" checked={form.is_prices_inclusive_tax} onChange={() => toggle('is_prices_inclusive_tax')} />
              <Toggle id="is_attachment_required" label="Attachment Required" checked={form.is_attachment_required} onChange={() => toggle('is_attachment_required')} />
              <Toggle id="is_in_affiliate" label="In Affiliate" checked={form.is_in_affiliate} onChange={() => toggle('is_in_affiliate')} />
            </div>
          </Card>

          <Card title="Stock and Shipping Settings" icon="shipping">
            <div className="space-y-4">
              <div>
                <label htmlFor="deliverable_city_type" className={labelCls}>Deliverable City Type</label>
                <select id="deliverable_city_type" value={form.deliverable_city_type} onChange={(e) => set('deliverable_city_type', e.target.value)} className={inputCls}>
                  {DELIVERABLE_TYPES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="deliverable_cities" className={labelCls}>Deliverable Cities</label>
                <input id="deliverable_cities" value={form.deliverable_cities} onChange={(e) => set('deliverable_cities', e.target.value)} className={inputCls} placeholder="Search City…" />
              </div>
              <div>
                <label htmlFor="low_stock_limit" className={labelCls}>Low Stock Limit</label>
                <input id="low_stock_limit" type="number" min="0" value={form.low_stock_limit} onChange={(e) => set('low_stock_limit', e.target.value)} className={inputCls} placeholder="Low stock limit" />
                <p className="mt-1 text-xs text-slate-500">Seller&apos;s default will apply if not specified.</p>
              </div>
              <div>
                <label htmlFor="pickup_location" className={labelCls}>Pickup Location for Standard Shipping</label>
                <select id="pickup_location" value={form.pickup_location} onChange={(e) => set('pickup_location', e.target.value)} className={inputCls}>
                  <option value="">Select option</option>
                  {pickupLocations.map((p) => <option key={p.id} value={p.id}>{p.pickup_location}</option>)}
                </select>
              </div>
            </div>
          </Card>

          <Card title="SEO Settings" icon="seo">
            <div className="space-y-4">
              <div>
                <label htmlFor="seo_page_title" className={labelCls}>SEO Page Title</label>
                <input id="seo_page_title" value={form.seo_page_title} onChange={(e) => set('seo_page_title', e.target.value)} className={inputCls} placeholder="SEO page title" />
                <p className="mt-1 text-xs text-slate-500">Optimize your page title for search engines.</p>
              </div>
              <div>
                <label htmlFor="seo_meta_keywords" className={labelCls}>SEO Meta Keywords</label>
                <input id="seo_meta_keywords" value={form.seo_meta_keywords} onChange={(e) => set('seo_meta_keywords', e.target.value)} className={inputCls} placeholder="Type and press enter to add keywords" />
                <p className="mt-1 text-xs text-slate-500">Type keywords and press enter to create tags.</p>
              </div>
              <div>
                <label className={labelCls}>SEO Meta Description</label>
                <RichTextEditor value={form.seo_meta_description} onChange={(v) => set('seo_meta_description', v)} minHeight={120} />
                <p className="mt-1 text-xs text-slate-500">Write a compelling description for search results.</p>
              </div>
              <MediaPickerCard
                title="SEO Open Graph Image"
                hint="Recommended: 1200 × 630 pixels"
                value={form.seo_og_image}
                onChange={(v) => set('seo_og_image', v)}
                kind="image"
                multi={false}
              />
            </div>
          </Card>
        </aside>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <button type="button" onClick={() => router.push('/admin/products')} className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60">
          {busy ? 'Saving…' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}

const ICONS = {
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  details: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2',
  media: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  desc: 'M4 6h16M4 10h16M4 14h10M4 18h10',
  cat: 'M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  shipping: 'M3 10h11l-1 11H4L3 10zm5-3V5a3 3 0 116 0v2M3 10h18',
  seo: 'M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z',
};

function Card({ title, icon, children }) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      {title && (
        <header className="px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            {icon && ICONS[icon] && (
              <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon]} /></svg>
            )}
            {title}
          </h2>
        </header>
      )}
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