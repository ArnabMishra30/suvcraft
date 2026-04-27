'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MediaPickerCard } from './media-picker';

const SECTIONS = [
  { id: 'general', label: 'General Settings' },
  { id: 'logo', label: 'Logo Settings' },
  { id: 'app-download', label: 'App download Section' },
  { id: 'social', label: 'Social Media Links' },
  { id: 'feature', label: 'Feature Section & Shipping' },
  { id: 'theme', label: 'Theme Color Settings' },
];

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

function Field({ label, hint, required, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-2 sm:gap-6 items-start py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <div className="sm:pt-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label} {required && <span className="text-red-500">*</span>}</label>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
      <div>{children}</div>
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
      <div className="px-5">{children}</div>
    </section>
  );
}

const MODERN_THEMES = [
  { value: 'default', label: 'Default' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'rose', label: 'Rose' },
  { value: 'amber', label: 'Amber' },
  { value: 'violet', label: 'Violet' },
];

export default function WebGeneralForm({ initial, logo: initLogo, footerLogo: initFooterLogo, favicon: initFavicon }) {
  const router = useRouter();
  const [v, setV] = useState({ ...initial });
  const [logo, setLogo] = useState(initLogo || '');
  const [footerLogo, setFooterLogo] = useState(initFooterLogo || '');
  const [favicon, setFavicon] = useState(initFavicon || '');
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

  function reset() {
    setV({ ...initial });
    setLogo(initLogo || ''); setFooterLogo(initFooterLogo || ''); setFavicon(initFavicon || '');
    setMsg({ kind: '', text: '' });
  }

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/web-general', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, logo, footer_logo: footerLogo, favicon }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Settings updated.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
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
              }`}>{sec.label}</a>
          ))}
        </div>
      </aside>

      <div className="space-y-6 pb-32">
        <Section id="general" title="General Settings" icon="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z">
          <Field label="Site Title" required><input className={inputCls} value={v.site_title || ''} onChange={(e) => set('site_title', e.target.value)} /></Field>
          <Field label="Support Number" required><input className={inputCls} value={v.support_number || ''} onChange={(e) => set('support_number', e.target.value)} /></Field>
          <Field label="Support Email" required><input type="email" className={inputCls} value={v.support_email || ''} onChange={(e) => set('support_email', e.target.value)} /></Field>
          <Field label="Copyright Details" required><textarea rows={2} className={inputCls} value={v.copyright_details || ''} onChange={(e) => set('copyright_details', e.target.value)} /></Field>
          <Field label="Address" required><textarea rows={2} className={inputCls} value={v.address || ''} onChange={(e) => set('address', e.target.value)} /></Field>
          <Field label="Short Description" required><textarea rows={3} className={inputCls} value={v.app_short_description || ''} onChange={(e) => set('app_short_description', e.target.value)} /></Field>
          <Field label="Map Iframe"><textarea rows={4} className={inputCls + ' font-mono text-xs'} value={v.map_iframe || ''} onChange={(e) => set('map_iframe', e.target.value)} placeholder="<iframe …>" /></Field>
          <Field label="Meta Keywords" required><input className={inputCls} value={v.meta_keywords || ''} onChange={(e) => set('meta_keywords', e.target.value)} /></Field>
          <Field label="Meta Description" required><textarea rows={2} className={inputCls} value={v.meta_description || ''} onChange={(e) => set('meta_description', e.target.value)} /></Field>
        </Section>

        <Section id="logo" title="Logo Settings" icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z">
          <div className="py-4 space-y-5">
            <MediaPickerCard title="Header Logo" hint="Recommended: 500 x 200 pixels" value={logo} onChange={setLogo} kind="image" />
            <MediaPickerCard title="Footer Logo" hint="Recommended: 500 x 200 pixels" value={footerLogo} onChange={setFooterLogo} kind="image" />
            <MediaPickerCard title="Favicon" hint="Recommended: 32 x 32 pixels (square)" value={favicon} onChange={setFavicon} kind="image" />
          </div>
        </Section>

        <Section id="app-download" title="App download Section" icon="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z">
          <Field label="App Download Section">
            <Toggle checked={Number(v.app_download_section) === 1} onChange={(b) => set('app_download_section', b ? 1 : 0)} />
          </Field>
          <Field label="Title" required><input className={inputCls} value={v.app_download_section_title || ''} onChange={(e) => set('app_download_section_title', e.target.value)} /></Field>
          <Field label="Tagline" required><input className={inputCls} value={v.app_download_section_tagline || ''} onChange={(e) => set('app_download_section_tagline', e.target.value)} /></Field>
          <Field label="Short Description" required><input className={inputCls} value={v.app_download_section_short_description || ''} onChange={(e) => set('app_download_section_short_description', e.target.value)} /></Field>
          <Field label="Playstore URL" required><input type="url" className={inputCls} value={v.app_download_section_playstore_url || ''} onChange={(e) => set('app_download_section_playstore_url', e.target.value)} /></Field>
          <Field label="Appstore URL" required><input type="url" className={inputCls} value={v.app_download_section_appstore_url || ''} onChange={(e) => set('app_download_section_appstore_url', e.target.value)} /></Field>
        </Section>

        <Section id="social" title="Social Media Links" icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z">
          <Field label="Twitter Link"><input type="url" className={inputCls} value={v.twitter_link || ''} onChange={(e) => set('twitter_link', e.target.value)} placeholder="https://twitter.com/" /></Field>
          <Field label="Facebook Link"><input type="url" className={inputCls} value={v.facebook_link || ''} onChange={(e) => set('facebook_link', e.target.value)} placeholder="https://facebook.com/" /></Field>
          <Field label="Instagram Link"><input type="url" className={inputCls} value={v.instagram_link || ''} onChange={(e) => set('instagram_link', e.target.value)} placeholder="https://instagram.com/" /></Field>
          <Field label="Youtube Link"><input type="url" className={inputCls} value={v.youtube_link || ''} onChange={(e) => set('youtube_link', e.target.value)} placeholder="https://youtube.com/" /></Field>
        </Section>

        <Section id="feature" title="Feature Section" icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z">
          {[
            ['shipping', 'Shipping'],
            ['return', 'Return'],
            ['support', 'Support'],
            ['safety_security', 'Safety & Security'],
          ].map(([prefix, label]) => (
            <div key={prefix} className="border-b border-slate-100 dark:border-slate-800 py-3 last:border-b-0">
              <Field label={`${label} Mode`}>
                <Toggle checked={Number(v[`${prefix}_mode`]) === 1} onChange={(b) => set(`${prefix}_mode`, b ? 1 : 0)} />
              </Field>
              <Field label={`${label} Title`} required>
                <input className={inputCls} value={v[`${prefix}_title`] || ''} onChange={(e) => set(`${prefix}_title`, e.target.value)} />
              </Field>
              <Field label={`${label} Description`}>
                <textarea rows={2} className={inputCls} value={v[`${prefix}_description`] || ''} onChange={(e) => set(`${prefix}_description`, e.target.value)} placeholder="Description" />
              </Field>
            </div>
          ))}
        </Section>

        <Section id="theme" title="Theme Color Settings" icon="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01">
          <div className="py-4 space-y-5">
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Classic Theme Color</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ['classic_primary_color', 'Primary'],
                  ['classic_secondary_color', 'Secondary'],
                  ['classic_font_color', 'Font'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-500 mb-1 text-center">{label}</label>
                    <input type="color" value={v[key] || '#000000'} onChange={(e) => set(key, e.target.value)}
                      className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 cursor-pointer" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Modern Theme Color</label>
              <select className={inputCls} value={v.modern_theme_color || 'default'} onChange={(e) => set('modern_theme_color', e.target.value)}>
                {MODERN_THEMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
        </Section>

        <div className="fixed bottom-0 right-0 lg:right-0 left-0 lg:left-64 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-end gap-2">
          {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
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