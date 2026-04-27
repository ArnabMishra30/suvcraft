'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password" placeholder={placeholder}
        className={`${inputCls} pr-9`} />
      <button type="button" onClick={() => setShow((s) => !s)} title={show ? 'Hide' : 'Show'}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
        {show ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        )}
      </button>
    </div>
  );
}

function StatusCard({ value, label, hint, accent, current, onClick }) {
  const palette = accent === 'rose'
    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
    : 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900 text-sky-700 dark:text-sky-300';
  const selected = current === value;
  return (
    <button type="button" onClick={() => onClick(value)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm font-medium ${palette} ${selected ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}>
      <span className={`w-3.5 h-3.5 rounded-full border-2 ${selected ? 'border-current bg-current' : 'border-current'}`} />
      {label}
    </button>
  );
}

export default function AffiliateFormModal({ open, onClose }) {
  const router = useRouter();
  const [v, setV] = useState({
    name: '', email: '', mobile: '', password: '', confirm_password: '',
    address: '', website_url: '', mobile_app_url: '', status: 0,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setV({ name: '', email: '', mobile: '', password: '', confirm_password: '', address: '', website_url: '', mobile_app_url: '', status: 0 });
    setErr('');
  }, [open]);

  function set(k, val) { setV((prev) => ({ ...prev, [k]: val })); }

  async function save() {
    if (!v.name.trim()) { setErr('Full name is required.'); return; }
    if (!v.email.trim()) { setErr('Email is required.'); return; }
    if (!v.mobile.trim()) { setErr('Mobile is required.'); return; }
    if (v.password.length < 6) { setErr('Password must be at least 6 characters.'); return; }
    if (v.password !== v.confirm_password) { setErr('Passwords do not match.'); return; }
    if (!v.address.trim()) { setErr('Address is required.'); return; }
    if (!v.website_url.trim()) { setErr('Website URL is required.'); return; }
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      onClose();
      router.refresh();
    } catch { setErr('Network error.'); }
    finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Affiliate User" size="lg"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : 'Add Affiliate User'}</button>
      </>}>
      <div className="space-y-3">
        <div>
          <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
          <input className={inputCls} value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="User Name" />
        </div>
        <div>
          <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
          <input type="email" className={inputCls} value={v.email} onChange={(e) => set('email', e.target.value)} placeholder="Enter Email" />
        </div>
        <div>
          <label className={labelCls}>Mobile <span className="text-red-500">*</span></label>
          <input className={inputCls} value={v.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="Enter Mobile" />
        </div>
        <div>
          <label className={labelCls}>Password <span className="text-red-500">*</span></label>
          <PasswordInput value={v.password} onChange={(val) => set('password', val)} placeholder="Type Password here" />
        </div>
        <div>
          <label className={labelCls}>Confirm Password <span className="text-red-500">*</span></label>
          <PasswordInput value={v.confirm_password} onChange={(val) => set('confirm_password', val)} placeholder="Type confirm Password here" />
        </div>
        <div>
          <label className={labelCls}>Address <span className="text-red-500">*</span></label>
          <textarea rows={2} className={inputCls} value={v.address} onChange={(e) => set('address', e.target.value)} placeholder="Enter Address" />
        </div>
        <div>
          <label className={labelCls}>Enter Your Website URL <span className="text-red-500">*</span></label>
          <input type="url" className={inputCls} value={v.website_url} onChange={(e) => set('website_url', e.target.value)} placeholder="https://www.example.com/myblog" />
        </div>
        <div>
          <label className={labelCls}>Enter Your Mobile APP URL <span className="text-red-500">*</span></label>
          <input type="url" className={inputCls} value={v.mobile_app_url} onChange={(e) => set('mobile_app_url', e.target.value)} placeholder="https://xxxx/dp/xxxx" />
          <p className="mt-1 text-xs text-slate-500">Enter your application app store or playstore link</p>
        </div>
        <div>
          <label className={labelCls}>Status <span className="text-red-500">*</span></label>
          <div className="flex gap-3">
            <StatusCard value={0} label="Not-Approved" accent="rose" current={v.status} onClick={(val) => set('status', val)} />
            <StatusCard value={1} label="Approved" accent="sky" current={v.status} onClick={(val) => set('status', val)} />
          </div>
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}