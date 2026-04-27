'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MediaPickerCard } from './media-picker';
import SearchableSelect from './searchable-select';

const TIMEZONES = [
  'UTC', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Bangkok',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Toronto',
  'America/Sao_Paulo', 'Africa/Cairo', 'Africa/Johannesburg', 'Australia/Sydney', 'Pacific/Auckland',
];

const REFER_METHODS = [
  { value: '', label: 'Select' },
  { value: 'amount', label: 'Amount (₹)' },
  { value: 'percentage', label: 'Percentage (%)' },
];

const SECTIONS = [
  { id: 'store-info', label: 'Store Information' },
  { id: 'logo', label: 'Logo Settings' },
  { id: 'localization', label: 'Localization & Regional Settings' },
  { id: 'app-versioning', label: 'App Versioning' },
  { id: 'cart-order', label: 'Cart & Order Settings' },
  { id: 'delivery', label: 'Delivery Settings' },
  { id: 'referral', label: 'Referral Settings' },
  { id: 'wallet', label: 'Wallet Settings' },
  { id: 'delivery-boy', label: 'Delivery Boy Settings' },
  { id: 'seller', label: 'Seller Settings' },
  { id: 'ai', label: 'AI Settings' },
  { id: 'app-features', label: 'App Features' },
  { id: 'native-links', label: 'Native App Links & Deep Linking' },
  { id: 'cron', label: 'Cron Jobs' },
  { id: 'maintenance', label: 'Maintenance Mode' },
];

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

function Toggle({ checked, onChange, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
      } disabled:opacity-50`}>
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-2 sm:gap-4 items-start">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 sm:pt-2">{label}</label>
      <div>
        {children}
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}

function Section({ id, title, icon, children }) {
  return (
    <section id={id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 scroll-mt-24">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
          {title}
        </h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  );
}

export default function StoreSettingsForm({ initial }) {
  const router = useRouter();
  const [logo, setLogo] = useState(initial.logo || '');
  const [favicon, setFavicon] = useState(initial.favicon || '');
  const [currency, setCurrency] = useState(initial.currency || '₹');
  const [s, setS] = useState({ ...initial.system_settings });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });
  const [activeId, setActiveId] = useState(SECTIONS[0].id);
  const sellers = initial.sellers || [];

  function set(key, value) { setS((prev) => ({ ...prev, [key]: value })); }

  useEffect(() => {
    function onScroll() {
      let current = SECTIONS[0].id;
      for (const sec of SECTIONS) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - 120 <= 0) current = sec.id;
      }
      setActiveId(current);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const currencyOptions = useMemo(() => initial.currencyOptions || [], [initial.currencyOptions]);

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/store', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_settings: s,
          logo, favicon, currency,
        }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Settings saved.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  function reset() {
    setLogo(initial.logo || '');
    setFavicon(initial.favicon || '');
    setCurrency(initial.currency || '₹');
    setS({ ...initial.system_settings });
    setMsg({ kind: '', text: '' });
  }

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
              }`}>
              {sec.label}
            </a>
          ))}
        </div>
      </aside>

      <div className="space-y-6 pb-32">
        <Section id="store-info" title="Store Information" icon="M21 13.255A23.93 23.93 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
          <Field label="App Name"><input className={inputCls} value={s.app_name || ''} onChange={(e) => set('app_name', e.target.value)} /></Field>
          <Field label="Support Number"><input className={inputCls} value={s.support_number || ''} onChange={(e) => set('support_number', e.target.value)} /></Field>
          <Field label="Support Email"><input type="email" className={inputCls} value={s.support_email || ''} onChange={(e) => set('support_email', e.target.value)} /></Field>
          <Field label="Copyright Details"><textarea rows={2} className={inputCls} value={s.copyright_details || ''} onChange={(e) => set('copyright_details', e.target.value)} /></Field>
          <Field label="Tax Name"><input className={inputCls} value={s.tax_name || ''} onChange={(e) => set('tax_name', e.target.value)} placeholder="GST Number" /></Field>
          <Field label="Tax Number"><input className={inputCls} value={s.tax_number || ''} onChange={(e) => set('tax_number', e.target.value)} /></Field>
        </Section>

        <Section id="logo" title="Logo Settings" icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
          <MediaPickerCard title="Logo" hint="Recommended: 500 x 200 pixels" value={logo} onChange={setLogo} kind="image" />
          <MediaPickerCard title="Favicon" hint="Recommended: 32 x 32 pixels (square)" value={favicon} onChange={setFavicon} kind="image" />
        </Section>

        <Section id="localization" title="Localization & Regional Settings" icon="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
          <Field label="System Timezone">
            <select className={inputCls} value={s.system_timezone || 'Asia/Kolkata'} onChange={(e) => set('system_timezone', e.target.value)}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </Field>
          <Field label="Country Currency Code">
            {currencyOptions.length ? (
              <select className={inputCls} value={s.supported_locals || ''} onChange={(e) => set('supported_locals', e.target.value)}>
                {currencyOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            ) : (
              <input className={inputCls} value={s.supported_locals || ''} onChange={(e) => set('supported_locals', e.target.value)} />
            )}
          </Field>
          <Field label="System Currency Symbol"><input className={inputCls} value={currency} onChange={(e) => setCurrency(e.target.value)} /></Field>
          <Field label="Decimal Point *">
            <select className={inputCls} value={s.decimal_point ?? '0'} onChange={(e) => set('decimal_point', e.target.value)}>
              {[0, 1, 2, 3, 4].map((n) => <option key={n} value={String(n)}>{n}</option>)}
            </select>
          </Field>
        </Section>

        <Section id="app-versioning" title="App Versioning" icon="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
          <Field label="Current Version Of Android APP"><input className={inputCls} value={s.current_version || ''} onChange={(e) => set('current_version', e.target.value)} /></Field>
          <Field label="Current Version Of IOS APP"><input className={inputCls} value={s.current_version_ios || ''} onChange={(e) => set('current_version_ios', e.target.value)} /></Field>
          <Field label="Version System Status"><Toggle checked={Number(s.is_version_system_on) === 1} onChange={(v) => set('is_version_system_on', v ? '1' : '0')} /></Field>
        </Section>

        <Section id="cart-order" title="Cart & Order Settings" icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z">
          <Field label="Minimum Cart Amount"><input type="number" className={inputCls} value={s.minimum_cart_amt ?? ''} onChange={(e) => set('minimum_cart_amt', e.target.value)} /></Field>
          <Field label="Maximum Items Allowed In Cart"><input type="number" className={inputCls} value={s.max_items_cart ?? ''} onChange={(e) => set('max_items_cart', e.target.value)} /></Field>
          <Field label="Low stock limit" hint="Product will be considered as low stock"><input type="number" className={inputCls} value={s.low_stock_limit ?? ''} onChange={(e) => set('low_stock_limit', e.target.value)} /></Field>
          <Field label="Max days to return item"><input type="number" className={inputCls} value={s.max_product_return_days ?? ''} onChange={(e) => set('max_product_return_days', e.target.value)} /></Field>
          <Field label="Single Seller Order System"><Toggle checked={Number(s.is_single_seller_order) === 1} onChange={(v) => set('is_single_seller_order', v ? '1' : '0')} /></Field>
          <Field label="Show Delivery boy based on seller's zipcode/city"><Toggle checked={Number(s.show_db_by_seller_area) === 1} onChange={(v) => set('show_db_by_seller_area', v ? '1' : '0')} /></Field>
        </Section>

        <Section id="delivery" title="Delivery Settings" icon="M9 17a2 2 0 11-4 0 2 2 0 014 0zm0 0h6m-6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 11-4 0 2 2 0 014 0zm0 0h2m-2 0a2 2 0 100-4 2 2 0 000 4zM5 9h14l1 7H4l1-7z">
          <Field label="Zipcode/City Wise Delivery Charge"><Toggle checked={Number(s.area_wise_delivery_charge) === 1} onChange={(v) => set('area_wise_delivery_charge', v ? '1' : '0')} /></Field>
          <Field label="Pincode-wise deliverability"><Toggle checked={Number(s.pincode_wise_deliverability) === 1} onChange={(v) => set('pincode_wise_deliverability', v ? '1' : '0')} /></Field>
          <Field label="City-wise deliverability"><Toggle checked={Number(s.city_wise_deliverability) === 1} onChange={(v) => set('city_wise_deliverability', v ? '1' : '0')} /></Field>
        </Section>

        <Section id="referral" title="Referral Settings (Refer & Earn)" icon="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z">
          <Field label="Refer & Earn Status"><Toggle checked={Number(s.is_refer_earn_on) === 1} onChange={(v) => set('is_refer_earn_on', v ? '1' : '0')} /></Field>
          <Field label="Minimum Order Amount (₹)"><input type="number" className={inputCls} value={s.min_refer_earn_order_amount ?? ''} onChange={(e) => set('min_refer_earn_order_amount', e.target.value)} /></Field>
          <Field label="Number of times Code can be redeemed"><input type="number" className={inputCls} value={s.refer_earn_bonus_times ?? ''} onChange={(e) => set('refer_earn_bonus_times', e.target.value)} /></Field>
          <Field label="Refer & Earn Method For User"><select className={inputCls} value={s.refer_earn_method_for_user || ''} onChange={(e) => set('refer_earn_method_for_user', e.target.value)}>{REFER_METHODS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
          <Field label="Refer & Earn Bonus For User (₹ OR %)"><input type="number" className={inputCls} value={s.refer_earn_bonus_for_user ?? ''} onChange={(e) => set('refer_earn_bonus_for_user', e.target.value)} /></Field>
          <Field label="Maximum Refer & Earn Amount For User (₹)"><input type="number" className={inputCls} value={s.max_refer_earn_amount_for_user ?? ''} onChange={(e) => set('max_refer_earn_amount_for_user', e.target.value)} /></Field>
          <Field label="Refer & Earn Method For Referral"><select className={inputCls} value={s.refer_earn_method_for_referal || 'amount'} onChange={(e) => set('refer_earn_method_for_referal', e.target.value)}>{REFER_METHODS.filter((m) => m.value).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
          <Field label="Refer & Earn Bonus For Referral (₹)"><input type="number" className={inputCls} value={s.refer_earn_bonus_for_referal ?? ''} onChange={(e) => set('refer_earn_bonus_for_referal', e.target.value)} /></Field>
        </Section>

        <Section id="wallet" title="Welcome Wallet Balance" icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m3 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H10a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z">
          <Field label="Wallet Balance Status"><Toggle checked={Number(s.welcome_wallet_balance_on) === 1} onChange={(v) => set('welcome_wallet_balance_on', v ? '1' : '0')} /></Field>
          <Field label="Wallet Balance Amount (₹)"><input type="number" className={inputCls} value={s.wallet_balance_amount ?? ''} onChange={(e) => set('wallet_balance_amount', e.target.value)} /></Field>
        </Section>

        <Section id="delivery-boy" title="Delivery Boy Settings" icon="M3 8l4-4 4 4M7 4v12m0 0l4 4 4-4m6-12v12">
          <Field label="Order Delivery OTP System"><Toggle checked={Number(s.is_delivery_boy_otp_setting_on) === 1} onChange={(v) => set('is_delivery_boy_otp_setting_on', v ? '1' : '0')} /></Field>
          <Field label="Delivery Boy Bonus (%)"><input type="number" className={inputCls} value={s.delivery_boy_bonus_percentage ?? ''} onChange={(e) => set('delivery_boy_bonus_percentage', e.target.value)} /></Field>
        </Section>

        <Section id="seller" title="Seller Settings" icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z">
          <Field label="Single Seller System"><Toggle checked={Number(s.is_single_seller_system) === 1} onChange={(v) => set('is_single_seller_system', v ? '1' : '0')} /></Field>
          <Field label="Select a seller">
            <SearchableSelect value={s.single_seller_id ? String(s.single_seller_id) : ''}
              onChange={(v) => set('single_seller_id', v)} options={sellers} placeholder="Search Seller…" />
          </Field>
        </Section>

        <Section id="ai" title="AI Settings" icon="M13 10V3L4 14h7v7l9-11h-7z">
          <Field label="AI Settings Status"><Toggle checked={Number(s.ai_status) === 1} onChange={(v) => set('ai_status', v ? '1' : '0')} /></Field>
          <Field label="Select AI Provider">
            <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
              {['gemini', 'openrouter'].map((p) => (
                <button type="button" key={p} onClick={() => set('ai_provider', p)}
                  className={`px-4 py-1.5 text-sm font-medium ${
                    s.ai_provider === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}>{p === 'gemini' ? 'Gemini' : 'OpenRouter'}</button>
              ))}
            </div>
          </Field>
          <Field label="Gemini API Key"><input className={inputCls} value={s.gemini_api_key || ''} onChange={(e) => set('gemini_api_key', e.target.value)} placeholder="Gemini API Key" /></Field>
          <Field label="OpenRouter API Key"><input className={inputCls} value={s.openrouter_api_key || ''} onChange={(e) => set('openrouter_api_key', e.target.value)} placeholder="OpenRouter API Key" /></Field>
        </Section>

        <Section id="app-features" title="App & System Features Settings" icon="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z">
          <Field label="Cart Button on Products List"><Toggle checked={Number(s.cart_btn_on_list) === 1} onChange={(v) => set('cart_btn_on_list', v ? '1' : '0')} /></Field>
          <Field label="Expand Product Images"><Toggle checked={Number(s.expand_product_images) === 1} onChange={(v) => set('expand_product_images', v ? '1' : '0')} /></Field>
          <Field label="Google Login"><Toggle checked={Number(s.google_login) === 1} onChange={(v) => set('google_login', v ? '1' : '0')} /></Field>
          <Field label="Apple Login"><Toggle checked={Number(s.apple_login) === 1} onChange={(v) => set('apple_login', v ? '1' : '0')} /></Field>
          <Field label="Enable WhatsApp Settings"><Toggle checked={Number(s.whatsapp_status) === 1} onChange={(v) => set('whatsapp_status', v ? '1' : '0')} /></Field>
          {Number(s.whatsapp_status) === 1 && (
            <Field label="WhatsApp Number"><input className={inputCls} value={s.whatsapp_number || ''} onChange={(e) => set('whatsapp_number', e.target.value)} /></Field>
          )}
        </Section>

        <Section id="native-links" title="Native App Links & Deep Linking" icon="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1">
          <Field label="Android Play Store Link *"><input className={inputCls} value={s.android_app_store_link || ''} onChange={(e) => set('android_app_store_link', e.target.value)} placeholder="Android App Store Link" /></Field>
          <Field label="iOS App Store Link"><input className={inputCls} value={s.ios_app_store_link || ''} onChange={(e) => set('ios_app_store_link', e.target.value)} placeholder="iOS App Store Link" /></Field>
          <Field label="Scheme For APP *"><input className={inputCls} value={s.scheme || ''} onChange={(e) => set('scheme', e.target.value)} placeholder="Scheme For APP" /></Field>
          <Field label="Domain name For APP"><input className={inputCls} value={s.host || ''} onChange={(e) => set('host', e.target.value)} placeholder="Domain name For APP" /></Field>
          <Field label="App Store Id *"><input className={inputCls} value={s.app_store_id || ''} onChange={(e) => set('app_store_id', e.target.value)} placeholder="App Store Id" /></Field>
          <Field label="Default Country Code"><input className={inputCls} value={s.default_country_code || ''} onChange={(e) => set('default_country_code', e.target.value)} placeholder="US" /></Field>
        </Section>

        <Section id="cron" title="Cron Job URLs" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
          {[
            ['cron_seller_commission_url', 'Seller Commission URL'],
            ['cron_promo_cashback_url', 'Promo Code Cashback Discount URL'],
            ['cron_settle_affiliate_url', 'Settle Affiliate Commission URL'],
            ['cron_delete_affiliate_url', 'Permanent Delete Affiliate Account URL'],
            ['cron_settle_referal_cashback_url', 'Settle Referal Cashback Discount URL'],
            ['cron_settle_referal_for_referal_url', 'Settle Referal Cashback Discount for Referal URL'],
            ['cron_remaining_cart_url', 'Remaining Cart Items URL'],
            ['cron_delete_draft_orders_url', 'Delete Draft Orders URL'],
          ].map(([key, label]) => (
            <Field key={key} label={label}><input className={inputCls} value={s[key] || ''} onChange={(e) => set(key, e.target.value)} /></Field>
          ))}
        </Section>

        <Section id="maintenance" title="Maintenance Mode" icon="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z">
          <Field label="Customer App Maintenance Mode"><Toggle checked={Number(s.is_customer_app_under_maintenance) === 1} onChange={(v) => set('is_customer_app_under_maintenance', v ? '1' : '0')} /></Field>
          <Field label="Message for Customer App"><textarea rows={2} className={inputCls} value={s.message_for_customer_app || ''} onChange={(e) => set('message_for_customer_app', e.target.value)} /></Field>
          <Field label="Seller App Maintenance Mode"><Toggle checked={Number(s.is_seller_app_under_maintenance) === 1} onChange={(v) => set('is_seller_app_under_maintenance', v ? '1' : '0')} /></Field>
          <Field label="Message for Seller App"><textarea rows={2} className={inputCls} value={s.message_for_seller_app || ''} onChange={(e) => set('message_for_seller_app', e.target.value)} /></Field>
          <Field label="Delivery Boy App Maintenance Mode"><Toggle checked={Number(s.is_delivery_boy_app_under_maintenance) === 1} onChange={(v) => set('is_delivery_boy_app_under_maintenance', v ? '1' : '0')} /></Field>
          <Field label="Message for Delivery Boy App"><textarea rows={2} className={inputCls} value={s.message_for_delivery_boy_app || ''} onChange={(e) => set('message_for_delivery_boy_app', e.target.value)} /></Field>
          <Field label="Web Maintenance Mode"><Toggle checked={Number(s.is_web_under_maintenance) === 1} onChange={(v) => set('is_web_under_maintenance', v ? '1' : '0')} /></Field>
          <Field label="Message for Web"><textarea rows={2} className={inputCls} value={s.message_for_web || ''} onChange={(e) => set('message_for_web', e.target.value)} /></Field>
        </Section>

        <div className="fixed bottom-0 right-0 lg:right-0 left-0 lg:left-64 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-end gap-2">
          {msg.text && (
            <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>
          )}
          <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button type="button" onClick={save} disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
            {busy ? 'Saving…' : 'Update Settings'}
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}