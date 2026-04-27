'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300';
const hintCls = 'mt-1 text-xs text-slate-500';

function Field({ label, hint, required, children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-2 sm:gap-6 items-start py-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
      <div className="sm:pt-2">
        <label className={labelCls}>{label} {required && <span className="text-red-500">*</span>}</label>
      </div>
      <div>
        {children}
        {hint && <p className={hintCls}>{hint}</p>}
      </div>
    </div>
  );
}

export default function EmailSettingsForm({ initial }) {
  const router = useRouter();
  const [email, setEmail] = useState(initial?.email || '');
  const [password, setPassword] = useState(initial?.password || '');
  const [smtpHost, setSmtpHost] = useState(initial?.smtp_host || '');
  const [smtpPort, setSmtpPort] = useState(initial?.smtp_port || '465');
  const [mailContentType, setMailContentType] = useState(initial?.mail_content_type || 'html');
  const [smtpEncryption, setSmtpEncryption] = useState(initial?.smtp_encryption || 'ssl');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  function reset() {
    setEmail(initial?.email || '');
    setPassword(initial?.password || '');
    setSmtpHost(initial?.smtp_host || '');
    setSmtpPort(initial?.smtp_port || '465');
    setMailContentType(initial?.mail_content_type || 'html');
    setSmtpEncryption(initial?.smtp_encryption || 'ssl');
    setMsg({ kind: '', text: '' });
  }

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/email', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password,
          smtp_host: smtpHost,
          smtp_port: smtpPort,
          mail_content_type: mailContentType,
          smtp_encryption: smtpEncryption,
        }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Email settings updated.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Email SMTP Settings
          </h2>
        </div>

        <div className="px-5">
          <Field label="Email address" required hint="This is the email address that the contact and report emails will be sent to, as well as being the from address in signup and notification emails.">
            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your_email@gmail.com" />
          </Field>
          <Field label="Password" required hint="Password of above given email.">
            <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="SMTP Host" required hint="This is the host address for your smtp server, this is only needed if you are using SMTP as the Email Send Type.">
            <input className={inputCls} value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.googlemail.com" />
          </Field>
          <Field label="SMTP Port" required hint="SMTP port this will provide your service provider.">
            <input type="number" className={inputCls} value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="465" />
          </Field>
          <Field label="Email Content Type" hint="Text-plain or HTML content chooser.">
            <select className={inputCls} value={mailContentType} onChange={(e) => setMailContentType(e.target.value)}>
              <option value="html">HTML</option>
              <option value="plain">Text-plain</option>
            </select>
          </Field>
          <Field label="SMTP Encryption" hint="If your e-mail service provider supported secure connections, you can choose security method on list.">
            <select className={inputCls} value={smtpEncryption} onChange={(e) => setSmtpEncryption(e.target.value)}>
              <option value="ssl">SSL</option>
              <option value="tls">TLS</option>
              <option value="none">None</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="sticky bottom-0 z-30 mt-6 -mx-1 sm:mx-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-3 flex items-center justify-end gap-2">
        {msg.text && (
          <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>
        )}
        <button type="button" onClick={reset} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
        <button type="button" onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
          {busy ? 'Saving…' : 'Update Email Settings'}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </>
  );
}