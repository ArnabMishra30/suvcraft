'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const SECTIONS = [
  { id: 'paypal', label: 'Paypal Payment Method' },
  { id: 'razorpay', label: 'Razorpay Payment Method' },
  { id: 'paystack', label: 'Paystack Payment Method' },
  { id: 'stripe', label: 'Stripe Payment Method' },
  { id: 'flutterwave', label: 'Flutterwave Payment Method' },
  { id: 'paytm', label: 'Paytm Payment Method' },
  { id: 'midtrans', label: 'Midtrans Payment Method' },
  { id: 'myfatoorah', label: 'MyFatoorah Payment Method' },
  { id: 'instamojo', label: 'Instamojo Payment Method' },
  { id: 'phonepe', label: 'PhonePe Payment Method' },
  { id: 'direct-bank', label: 'Direct Bank Transfer' },
  { id: 'cod', label: 'Cash On Delivery' },
];

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

const CURRENCY_OPTIONS = ['USD', 'INR', 'EUR', 'GBP', 'AED', 'SGD', 'AUD', 'CAD', 'NGN', 'IDR', 'MYR', 'PKR', 'BDT'];
const COUNTRY_OPTIONS = ['SA', 'KW', 'AE', 'QA', 'BH', 'OM', 'JO', 'EG', 'IN', 'US', 'GB'];

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

function Field({ label, hint, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-2 sm:gap-6 items-start py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <div className="sm:pt-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        {hint && <div className="text-[10px] text-slate-500 mt-0.5">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ReadonlyUrl({ value }) {
  return (
    <div className="flex items-center gap-1">
      <input readOnly value={value} className={`${inputCls} bg-slate-50 dark:bg-slate-950 text-slate-500 cursor-not-allowed`} />
      <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(value); } catch {} }}
        title="Copy" className="p-2 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </button>
    </div>
  );
}

function GatewayCard({ id, title, enabledKey, value, set, children }) {
  return (
    <section id={id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 scroll-mt-24">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          {title}
        </h2>
      </div>
      <div className="px-5">
        <Field label={
          <span>{title.replace(' Payments', '')} Payments <span className="text-slate-400 text-xs">[ Enable / Disable ]</span></span>
        }>
          <Toggle checked={Number(value[enabledKey]) === 1} onChange={(v) => set(enabledKey, v ? 1 : 0)} />
        </Field>
        {children}
      </div>
    </section>
  );
}

export default function PaymentMethodsForm({ initial, baseUrl = '' }) {
  const router = useRouter();
  const [v, setV] = useState({ ...initial });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  function set(key, value) { setV((prev) => ({ ...prev, [key]: value })); }

  useEffect(() => {
    function onScroll() {
      let current = SECTIONS[0].id;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - 120 <= 0) current = sec.id;
      }
      setActiveId(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/payment-methods', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Payment settings updated.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  function reset() { setV({ ...initial }); setMsg({ kind: '', text: '' }); }

  const url = (path) => `${baseUrl}${path}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
      <aside className="lg:sticky lg:top-20 self-start">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 max-h-[calc(100vh-7rem)] overflow-y-auto">
          {SECTIONS.map((sec) => (
            <a key={sec.id} href={`#${sec.id}`}
              className={`block px-3 py-2 text-sm rounded-md transition ${
                activeId === sec.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}>{sec.label}</a>
          ))}
        </div>
      </aside>

      <div className="space-y-6 pb-32">
        <GatewayCard id="paypal" title="Paypal Payments" enabledKey="paypal_payment_method" value={v} set={set}>
          <Field label="Payment Mode" hint="[ sandbox / live ]">
            <select className={inputCls} value={v.paypal_mode || ''} onChange={(e) => set('paypal_mode', e.target.value)}>
              <option value="">Select Mode</option>
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="live">Live</option>
            </select>
          </Field>
          <Field label="Paypal Business Email"><input className={inputCls} value={v.paypal_business_email || ''} onChange={(e) => set('paypal_business_email', e.target.value)} placeholder="paypal_business_email" /></Field>
          <Field label="Paypal Client id"><input className={inputCls} value={v.paypal_client_id || ''} onChange={(e) => set('paypal_client_id', e.target.value)} placeholder="Paypal Client id" /></Field>
          <Field label="Paypal Secret Key"><input className={inputCls} value={v.paypal_secret_key || ''} onChange={(e) => set('paypal_secret_key', e.target.value)} /></Field>
          <Field label="Currency">
            <select className={inputCls} value={v.currency_code || 'USD'} onChange={(e) => set('currency_code', e.target.value)}>
              {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Notification URL" hint="Set this as IPN notification URL in your PayPal account"><ReadonlyUrl value={url('/api/v1/ipn')} /></Field>
        </GatewayCard>

        <GatewayCard id="razorpay" title="Razorpay Payments" enabledKey="razorpay_payment_method" value={v} set={set}>
          <Field label="Razorpay key ID"><input className={inputCls} value={v.razorpay_key_id || ''} onChange={(e) => set('razorpay_key_id', e.target.value)} placeholder="rzp_test_key" /></Field>
          <Field label="Secret Key"><input className={inputCls} value={v.razorpay_secret_key || ''} onChange={(e) => set('razorpay_secret_key', e.target.value)} /></Field>
          <Field label="Payment Endpoint URL" hint="Set this as Endpoint URL in your Razorpay account"><ReadonlyUrl value={url('/api/admin/webhook/razorpay')} /></Field>
          <Field label="Webhook Secret Key"><input className={inputCls} value={v.razorpay_webhook_secret || ''} onChange={(e) => set('razorpay_webhook_secret', e.target.value)} placeholder="Webhook Secret Key" /></Field>
        </GatewayCard>

        <GatewayCard id="paystack" title="Paystack Payments" enabledKey="paystack_payment_method" value={v} set={set}>
          <Field label="Paystack key ID"><input className={inputCls} value={v.paystack_key_id || ''} onChange={(e) => set('paystack_key_id', e.target.value)} placeholder="paystack_public_key" /></Field>
          <Field label="Secret Key"><input className={inputCls} value={v.paystack_secret_key || ''} onChange={(e) => set('paystack_secret_key', e.target.value)} placeholder="paystack_secret_key" /></Field>
          <Field label="Payment Endpoint URL" hint="Set this as Endpoint URL in your Paystack account"><ReadonlyUrl value={url('/api/v1/paystack-webhook')} /></Field>
        </GatewayCard>

        <GatewayCard id="stripe" title="Stripe Payments" enabledKey="stripe_payment_method" value={v} set={set}>
          <Field label="Payment Mode" hint="[ sandbox / live ]">
            <select className={inputCls} value={v.stripe_payment_mode || ''} onChange={(e) => set('stripe_payment_mode', e.target.value)}>
              <option value="">Select Mode</option>
              <option value="test">Sandbox (Testing)</option>
              <option value="live">Live</option>
            </select>
          </Field>
          <Field label="Publishable Key"><input className={inputCls} value={v.stripe_publishable_key || ''} onChange={(e) => set('stripe_publishable_key', e.target.value)} placeholder="test_key" /></Field>
          <Field label="Secret Key"><input className={inputCls} value={v.stripe_secret_key || ''} onChange={(e) => set('stripe_secret_key', e.target.value)} /></Field>
          <Field label="Webhook Secret Key"><input className={inputCls} value={v.stripe_webhook_secret_key || ''} onChange={(e) => set('stripe_webhook_secret_key', e.target.value)} placeholder="webhook_secret" /></Field>
          <Field label="Currency Code" hint="[ Stripe supported ]">
            <select className={inputCls} value={v.stripe_currency_code || 'INR'} onChange={(e) => set('stripe_currency_code', e.target.value)}>
              {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Payment Endpoint URL" hint="Set this as Endpoint URL in your Stripe account"><ReadonlyUrl value={url('/api/v1/stripe_webhook')} /></Field>
        </GatewayCard>

        <GatewayCard id="flutterwave" title="Flutterwave Payments" enabledKey="flutterwave_payment_method" value={v} set={set}>
          <Field label="Public Key"><input className={inputCls} value={v.flutterwave_public_key || ''} onChange={(e) => set('flutterwave_public_key', e.target.value)} placeholder="public_key" /></Field>
          <Field label="Secret Key"><input className={inputCls} value={v.flutterwave_secret_key || ''} onChange={(e) => set('flutterwave_secret_key', e.target.value)} /></Field>
          <Field label="Flutterwave Encryption key"><input className={inputCls} value={v.flutterwave_encryption_key || ''} onChange={(e) => set('flutterwave_encryption_key', e.target.value)} placeholder="enc_key" /></Field>
          <Field label="Currency Code" hint="[ Flutterwave supported ]">
            <select className={inputCls} value={v.flutterwave_currency_code || 'NGN'} onChange={(e) => set('flutterwave_currency_code', e.target.value)}>
              {CURRENCY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Webhook Secret Key"><input className={inputCls} value={v.flutterwave_webhook_secret || ''} onChange={(e) => set('flutterwave_webhook_secret', e.target.value)} placeholder="Flutterwave Webhook Secret Key" /></Field>
          <Field label="Payment Endpoint URL" hint="Set this as Endpoint URL in your Flutterwave account"><ReadonlyUrl value={url('/api/v1/flutterwave_webhook')} /></Field>
        </GatewayCard>

        <GatewayCard id="paytm" title="Paytm Payments" enabledKey="paytm_payment_method" value={v} set={set}>
          <Field label="Payment Mode" hint="[ sandbox / live ]">
            <select className={inputCls} value={v.paytm_payment_mode || ''} onChange={(e) => set('paytm_payment_mode', e.target.value)}>
              <option value="">Select Mode</option>
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="live">Live</option>
            </select>
          </Field>
          <Field label="Merchant Key"><input className={inputCls} value={v.paytm_merchant_key || ''} onChange={(e) => set('paytm_merchant_key', e.target.value)} placeholder="merchant_key" /></Field>
          <Field label="Merchant ID"><input className={inputCls} value={v.paytm_merchant_id || ''} onChange={(e) => set('paytm_merchant_id', e.target.value)} placeholder="merchant_id" /></Field>
          <Field label="Paytm Website"><input className={inputCls} value={v.paytm_website || ''} onChange={(e) => set('paytm_website', e.target.value)} placeholder="WEBSTAGING" /></Field>
          <Field label="Industry Type ID"><input className={inputCls} value={v.paytm_industry_type_id || ''} onChange={(e) => set('paytm_industry_type_id', e.target.value)} placeholder="Paytm Industry Type ID" /></Field>
        </GatewayCard>

        <GatewayCard id="midtrans" title="Midtrans Payments" enabledKey="midtrans_payment_method" value={v} set={set}>
          <Field label="Midtrans Mode" hint="[ sandbox / live ]">
            <select className={inputCls} value={v.midtrans_mode || ''} onChange={(e) => set('midtrans_mode', e.target.value)}>
              <option value="">Select Mode</option>
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="live">Live</option>
            </select>
          </Field>
          <Field label="Client Key"><input className={inputCls} value={v.midtrans_client_key || ''} onChange={(e) => set('midtrans_client_key', e.target.value)} placeholder="Midtrans Client Key" /></Field>
          <Field label="Merchant ID"><input className={inputCls} value={v.midtrans_merchant_id || ''} onChange={(e) => set('midtrans_merchant_id', e.target.value)} placeholder="Midtrans Merchant ID" /></Field>
          <Field label="Server Key"><input className={inputCls} value={v.midtrans_server_key || ''} onChange={(e) => set('midtrans_server_key', e.target.value)} placeholder="Midtrans Server Key" /></Field>
          <Field label="Notification URL" hint="Set this as Webhook URL in your Midtrans account"><ReadonlyUrl value={url('/api/v1/midtrans_webhook')} /></Field>
          <Field label="Payment Return URL" hint="Set this as Finish URL in your Midtrans account"><ReadonlyUrl value={url('/api/v1/midtrans_payment_process')} /></Field>
        </GatewayCard>

        <GatewayCard id="myfatoorah" title="Myfatoorah Payments" enabledKey="myfatoorah_payment_method" value={v} set={set}>
          <Field label="Myfatoorah Mode" hint="[ sandbox / live ]">
            <select className={inputCls} value={v.myfatoorah_mode || ''} onChange={(e) => set('myfatoorah_mode', e.target.value)}>
              <option value="">Select Mode</option>
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="live">Live</option>
            </select>
          </Field>
          <Field label="Myfatoorah Language">
            <select className={inputCls} value={v.myfatoorah_language || ''} onChange={(e) => set('myfatoorah_language', e.target.value)}>
              <option value="">Select Language</option>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </Field>
          <Field label="Myfatoorah Country" hint="[ test / live ]">
            <select className={inputCls} value={v.myfatoorah_country || ''} onChange={(e) => set('myfatoorah_country', e.target.value)}>
              <option value="">Select country</option>
              {COUNTRY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Myfatoorah Token"><input className={inputCls} value={v.myfatoorah_token || ''} onChange={(e) => set('myfatoorah_token', e.target.value)} placeholder="myfatoorah_token" /></Field>
          <Field label="Payment secret key"><input className={inputCls} value={v.myfatoorah_payment_secret_key || ''} onChange={(e) => set('myfatoorah_payment_secret_key', e.target.value)} /></Field>
          <Field label="Notification URL" hint="Set this as Webhook URL in your MyFatoorah account"><ReadonlyUrl value={url('/admin/webhook/myfatoorah')} /></Field>
          <Field label="Payment success Url"><ReadonlyUrl value={url('/admin/webhook/myfatoorah_success_url')} /></Field>
          <Field label="Payment error Url"><ReadonlyUrl value={url('/admin/webhook/myfatoorah_error_url')} /></Field>
        </GatewayCard>

        <GatewayCard id="instamojo" title="Instamojo Payments" enabledKey="instamojo_payment_method" value={v} set={set}>
          <Field label="Instamojo Mode" hint="[ sandbox / live ]">
            <select className={inputCls} value={v.instamojo_mode || ''} onChange={(e) => set('instamojo_mode', e.target.value)}>
              <option value="">Select Mode</option>
              <option value="sandbox">Sandbox (Testing)</option>
              <option value="live">Live</option>
            </select>
          </Field>
          <Field label="Client ID"><input className={inputCls} value={v.instamojo_client_id || ''} onChange={(e) => set('instamojo_client_id', e.target.value)} placeholder="Instamojo Client ID" /></Field>
          <Field label="Client Secret"><input className={inputCls} value={v.instamojo_client_secret || ''} onChange={(e) => set('instamojo_client_secret', e.target.value)} placeholder="Instamojo Client Secret" /></Field>
          <Field label="Payment Endpoint URL" hint="Set this as Endpoint URL in your Instamojo account"><ReadonlyUrl value={url('/admin/webhook/instamojo_webhook')} /></Field>
        </GatewayCard>

        <GatewayCard id="phonepe" title="Phone Pe Payments" enabledKey="phonepe_payment_method" value={v} set={set}>
          <Field label="PhonePe Mode" hint="[ SANDBOX / UAT / PRODUCTION ]">
            <select className={inputCls} value={v.phonepe_mode || ''} onChange={(e) => set('phonepe_mode', e.target.value)}>
              <option value="">Select Mode</option>
              <option value="sandbox">SANDBOX</option>
              <option value="uat">UAT</option>
              <option value="production">PRODUCTION</option>
            </select>
          </Field>
          <Field label="Merchant ID"><input className={inputCls} value={v.phonepe_merchant_id || ''} onChange={(e) => set('phonepe_merchant_id', e.target.value)} placeholder="PhonePe Merchant ID" /></Field>
          <Field label="Client ID"><input className={inputCls} value={v.phonepe_client_id || ''} onChange={(e) => set('phonepe_client_id', e.target.value)} placeholder="PhonePe Client ID" /></Field>
          <Field label="Client Secret"><input className={inputCls} value={v.phonepe_client_secret || ''} onChange={(e) => set('phonepe_client_secret', e.target.value)} placeholder="PhonePe Client Secret" /></Field>
          <Field label="Payment Endpoint URL" hint="Set this as Endpoint URL in your PhonePe account"><ReadonlyUrl value={url('/admin/webhook/phonepe_webhook')} /></Field>
        </GatewayCard>

        <GatewayCard id="direct-bank" title="Direct Bank Transfer" enabledKey="direct_bank_transfer" value={v} set={set}>
          <Field label="Account Name"><input className={inputCls} value={v.account_name || ''} onChange={(e) => set('account_name', e.target.value)} /></Field>
          <Field label="Account Number"><input className={inputCls} value={v.account_number || ''} onChange={(e) => set('account_number', e.target.value)} /></Field>
          <Field label="Bank Name"><input className={inputCls} value={v.bank_name || ''} onChange={(e) => set('bank_name', e.target.value)} /></Field>
          <Field label="Bank Code"><input className={inputCls} value={v.bank_code || ''} onChange={(e) => set('bank_code', e.target.value)} /></Field>
          <Field label="Notes"><textarea rows={5} className={inputCls} value={v.notes || ''} onChange={(e) => set('notes', e.target.value)} /></Field>
        </GatewayCard>

        <GatewayCard id="cod" title="Cash On Delivery" enabledKey="cod_method" value={v} set={set}>
          <Field label="Minimum Cash On Delivery Amount"><input type="number" className={inputCls} value={v.minimum_cod_amount ?? ''} onChange={(e) => set('minimum_cod_amount', e.target.value)} placeholder="0" /></Field>
          <Field label="Maximum Cash On Delivery Amount"><input type="number" className={inputCls} value={v.maximum_cod_amount ?? ''} onChange={(e) => set('maximum_cod_amount', e.target.value)} placeholder="0" /></Field>
        </GatewayCard>

        <div className="fixed bottom-0 right-0 lg:right-0 left-0 lg:left-64 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-end gap-2">
          {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
          <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button type="button" onClick={save} disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
            {busy ? 'Saving…' : 'Update Payment Settings'}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}