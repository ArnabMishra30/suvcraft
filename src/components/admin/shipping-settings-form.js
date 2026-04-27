'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

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

function Field({ label, hint, required, children, error }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[16rem_1fr] gap-2 sm:gap-6 items-start py-3">
      <div className="sm:pt-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label} {required && <span className="text-red-500">*</span>}</label>
      </div>
      <div>
        {children}
        {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
        {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
      </div>
    </div>
  );
}

function RadioCard({ checked, onClick, title, subtitle }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-start gap-3 text-left p-3 rounded-lg border transition w-full ${
        checked
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}>
      <span className={`mt-0.5 inline-flex w-4 h-4 rounded-full border-2 flex-shrink-0 ${checked ? 'border-indigo-600' : 'border-slate-400'}`}>
        {checked && <span className="m-auto w-2 h-2 rounded-full bg-indigo-600" />}
      </span>
      <span>
        <span className="block text-sm font-medium text-slate-900 dark:text-white">{title}</span>
        <span className="block text-xs text-slate-500">{subtitle}</span>
      </span>
    </button>
  );
}

function Section({ title, icon, children, action }) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
          {title}
        </h2>
        {action}
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </section>
  );
}

export default function ShippingSettingsForm({ initial, baseUrl = '' }) {
  const router = useRouter();
  const [v, setV] = useState({
    pincode_wise_deliverability: 0,
    city_wise_deliverability: 1,
    deliverability_type: 'zipcode_city_wise',
    local_shipping_method: 1,
    default_delivery_charge: '',
    shiprocket_shipping_method: 0,
    email: '',
    password: '',
    standard_shipping_free_delivery: 0,
    minimum_free_delivery_order_amount: '',
    ...initial,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });
  const [helpDeliv, setHelpDeliv] = useState(false);
  const [helpCharge, setHelpCharge] = useState(false);

  function set(key, value) { setV((prev) => ({ ...prev, [key]: value })); }

  function pickMethod(m) {
    if (m === 'pincode') set('pincode_wise_deliverability', 1) | set('city_wise_deliverability', 0);
    else set('pincode_wise_deliverability', 0) | set('city_wise_deliverability', 1);
  }

  function reset() { setV({ ...v, ...initial }); setMsg({ kind: '', text: '' }); }

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/shipping', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pincode_wise_deliverability: Number(v.pincode_wise_deliverability) ? 1 : 0,
          city_wise_deliverability: Number(v.city_wise_deliverability) ? 1 : 0,
          deliverability_type: v.deliverability_type,
          local_shipping_method: Number(v.local_shipping_method) ? 1 : 0,
          default_delivery_charge: String(v.default_delivery_charge || 0),
          shiprocket_shipping_method: Number(v.shiprocket_shipping_method) ? 1 : 0,
          email: v.email || '',
          password: v.password || '',
          webhook_token: v.webhook_token || '',
          standard_shipping_free_delivery: Number(v.standard_shipping_free_delivery) ? 1 : 0,
          minimum_free_delivery_order_amount: String(v.minimum_free_delivery_order_amount || 0),
        }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Shipping settings updated.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="space-y-6 pb-32">
        <Section title="Product Deliverability"
          icon="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
          action={
            <button type="button" onClick={() => setHelpDeliv(true)}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-500 font-medium">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              How it Works?
            </button>
          }>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RadioCard
              checked={Number(v.pincode_wise_deliverability) === 1}
              onClick={() => pickMethod('pincode')}
              title="Pincode Wise Deliverability"
              subtitle="Use For local and Standard shipping both" />
            <RadioCard
              checked={Number(v.city_wise_deliverability) === 1}
              onClick={() => pickMethod('city')}
              title="City Wise Deliverability"
              subtitle="Use Only for local Shipping method" />
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-3 mb-2">Deliverability Type</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RadioCard
                checked={v.deliverability_type === 'zipcode_city_wise'}
                onClick={() => set('deliverability_type', 'zipcode_city_wise')}
                title="Zipcode / City Wise"
                subtitle="Classic per-zipcode/city deliverability" />
              <RadioCard
                checked={v.deliverability_type === 'group_wise'}
                onClick={() => set('deliverability_type', 'group_wise')}
                title="Group Wise"
                subtitle="Use Zipcode/City Groups for deliverability" />
            </div>
          </div>
        </Section>

        <Section title="Local Shipping Settings" icon="M9 17a2 2 0 11-4 0 2 2 0 014 0zm0 0h6m-6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 11-4 0 2 2 0 014 0zm0 0h2m-2 0a2 2 0 100-4 2 2 0 000 4zM5 9h14l1 7H4l1-7z">
          <Field label="Enable Local Shipping">
            <div className="flex items-center gap-3">
              <Toggle checked={Number(v.local_shipping_method) === 1} onChange={(b) => set('local_shipping_method', b ? 1 : 0)} />
              <span className="text-xs text-slate-500">( Use Local Delivery Boy For Shipping )</span>
            </div>
          </Field>
          <Field label="Default Delivery Charge" required>
            <input type="number" className={inputCls} value={v.default_delivery_charge ?? ''} onChange={(e) => set('default_delivery_charge', e.target.value)} />
            <button type="button" onClick={() => setHelpCharge(true)}
              className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-500 font-medium">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              How Default delivery charge work?
            </button>
          </Field>
        </Section>

        <Section title="Standard Shipping Settings" icon="M9 17a2 2 0 11-4 0 2 2 0 014 0zm0 0h6m-6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 11-4 0 2 2 0 014 0zm0 0h2m-2 0a2 2 0 100-4 2 2 0 000 4zM5 9h14l1 7H4l1-7z">
          <Field label="Enable Standard Shipping Method (Shiprocket)">
            <div className="flex items-center gap-3 flex-wrap">
              <Toggle checked={Number(v.shiprocket_shipping_method) === 1} onChange={(b) => set('shiprocket_shipping_method', b ? 1 : 0)} />
              <span className="text-xs text-slate-500">( Enable/Disable )</span>
              <a href="https://app.shiprocket.in/register" target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:text-indigo-500">Click here to get credentials.</a>
              <a href="https://www.shiprocket.in/" target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:text-indigo-500">What is shiprocket?</a>
            </div>
          </Field>
          <Field label="Email" required>
            <input type="email" className={inputCls} value={v.email || ''} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Password" required>
            <input type="password" className={inputCls} value={v.password || ''} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Shiprocket Webhook Url" required>
            <div className="flex items-center gap-1">
              <input readOnly className={`${inputCls} bg-slate-50 dark:bg-slate-950 text-slate-500`} value={`${baseUrl}/api/v1/shiprocket-webhook`} />
              <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(`${baseUrl}/api/v1/shiprocket-webhook`); } catch {} }}
                title="Copy" className="p-2 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            </div>
          </Field>
          <Field label="Enable Free Delivery Charge">
            <Toggle checked={Number(v.standard_shipping_free_delivery) === 1} onChange={(b) => set('standard_shipping_free_delivery', b ? 1 : 0)} />
            <p className="mt-1 text-xs text-red-600">
              <span className="font-semibold">Note:</span> You can give free delivery charge only when <span className="font-semibold">Standard delivery method</span> is enabled.
            </p>
          </Field>
          <Field label="Minimum Free Delivery Order Amount">
            <input type="number" className={inputCls} value={v.minimum_free_delivery_order_amount ?? ''} onChange={(e) => set('minimum_free_delivery_order_amount', e.target.value)} />
          </Field>
        </Section>
      </div>

      <div className="fixed bottom-0 right-0 lg:right-0 left-0 lg:left-64 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-end gap-2">
        {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
        <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="button" onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
          {busy ? 'Saving…' : 'Update Shipping Settings'}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>

      <Modal open={helpDeliv} onClose={() => setHelpDeliv(false)} title="How Product Deliverability Works" size="lg"
        footer={<button type="button" onClick={() => setHelpDeliv(false)} className="px-4 py-2 rounded-md text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600">Close</button>}>
        <div className="space-y-4 text-sm">
          <p className="text-slate-700 dark:text-slate-300">Configure how sellers manage product delivery locations throughout your platform:</p>
          <div>
            <div className="text-indigo-600 dark:text-indigo-400 font-medium mb-1 flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Deliverability Method
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
              <li><span className="font-semibold">Pincode Wise:</span> Sellers can specify delivery availability by postal/zip codes.</li>
              <li><span className="font-semibold">City Wise:</span> Sellers define delivery areas by city names.</li>
            </ul>
          </div>
          <div>
            <div className="text-indigo-600 dark:text-indigo-400 font-medium mb-1 flex items-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Deliverability Type
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
              <li><span className="font-semibold">Zipcode / City Wise:</span> Classic approach where sellers can add individual zipcodes/cities one by one for each product.</li>
              <li><span className="font-semibold">Group Wise:</span> Advanced system where sellers manage multiple zipcodes/cities as groups, making it easier to apply delivery settings to multiple locations at once.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 p-3 flex gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
            <div>
              <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">Important:</div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-amber-800 dark:text-amber-300 mt-1">
                <li>When you enable <span className="font-semibold">Group Wise</span> deliverability, sellers will not be able to add single zipcodes/cities individually. They must use groups.</li>
                <li>Changing this setting affects how all sellers configure their product deliverability. Communicate changes to your sellers.</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={helpCharge} onClose={() => setHelpCharge(false)} title="How Default Delivery charges work?" size="md"
        footer={<>
          <button type="button" onClick={() => setHelpCharge(false)} className="px-4 py-2 rounded-md text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-600">Close</button>
          <button type="button" onClick={() => setHelpCharge(false)} className="px-4 py-2 rounded-md text-sm bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 font-medium">Got it!</button>
        </>}>
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p>The default delivery charges are applied to all orders unless specified otherwise. Here&apos;s how it works:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>This is For if seller is not from users area.</li>
            <li>This is only apply when <em>get delivery boy based on seller</em> button is on from admin panel → store settings.</li>
            <li>We have two seller products in user cart, say seller1 and seller2.</li>
            <li>User&apos;s selected zipcode is 123456. seller1&apos;s serviceable zipcode is 123456,456789. seller2&apos;s serviceable zipcode is 654987.</li>
            <li>so user gets delivery charge of seller1 from zipcode-based and seller2&apos;s delivery charge from here (default delivery charge).</li>
            <li>reason: user&apos;s pincode is in seller1&apos;s serviceable zipcodes and not in seller2&apos;s serviceable zipcode.</li>
          </ul>
        </div>
      </Modal>
    </>
  );
}