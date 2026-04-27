'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SYSTEM_MODULES, SYSTEM_ROLES } from '@/lib/system-modules';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';
const ALL_ACTIONS = ['create', 'read', 'update', 'delete'];

export default function SystemUserForm({ initial = null }) {
  const isEdit = !!initial?.id;
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    username: initial?.username || '',
    mobile: initial?.mobile || '',
    email: initial?.email || '',
    password: '',
    confirm_password: '',
    role: initial?.role == null ? '' : String(initial.role),
  }));
  const [perms, setPerms] = useState(() => normalizePerms(initial?.permissions));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const roleNum = form.role === '' ? null : Number(form.role);
  const isSuperAdmin = roleNum === 0;

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function togglePerm(modKey, action, on) {
    setPerms((p) => {
      const next = { ...p, [modKey]: new Set(p[modKey] || []) };
      if (on) next[modKey].add(action); else next[modKey].delete(action);
      return next;
    });
  }

  function toggleColumn(action) {
    const everyHas = SYSTEM_MODULES.every((m) => !m.actions.includes(action) || perms[m.key]?.has(action));
    setPerms((p) => {
      const next = { ...p };
      for (const m of SYSTEM_MODULES) {
        if (!m.actions.includes(action)) continue;
        const set = new Set(next[m.key] || []);
        if (everyHas) set.delete(action); else set.add(action);
        next[m.key] = set;
      }
      return next;
    });
  }

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (form.role === '') { setErr('Please select a role.'); return; }
    if (!isEdit || form.password) {
      if (form.password !== form.confirm_password) { setErr('Passwords do not match.'); return; }
    }
    setBusy(true);
    try {
      const body = {
        username: form.username,
        mobile: form.mobile,
        email: form.email,
        role: Number(form.role),
        permissions: serialize(perms),
      };
      if (form.password) { body.password = form.password; body.confirm_password = form.confirm_password; }
      const url = isEdit ? `/api/admin/system-users/${initial.id}` : '/api/admin/system-users';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      router.push('/admin/system-users');
      router.refresh();
    } catch (ex) {
      setErr(ex.message || 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-6 items-start">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            User Information
          </h2>
        </div>
        <div className="p-5 space-y-4">
          {err && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{err}</div>}
          <Field label="Username *">
            <input className={inputCls} value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="Enter Username" required />
          </Field>
          <Field label="Mobile *">
            <input className={inputCls} value={form.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="Enter Mobile Number" required />
          </Field>
          <Field label="Email *">
            <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="Enter Email Address" required />
          </Field>
          <Field label={isEdit ? 'Password (leave blank to keep)' : 'Password *'}>
            <PasswordInput value={form.password} onChange={(v) => set('password', v)} show={showPwd} onToggle={() => setShowPwd((s) => !s)} placeholder="Enter Password" required={!isEdit} />
          </Field>
          <Field label={isEdit ? 'Confirm Password' : 'Confirm Password *'}>
            <PasswordInput value={form.confirm_password} onChange={(v) => set('confirm_password', v)} show={showConfirm} onToggle={() => setShowConfirm((s) => !s)} placeholder="Confirm Password" required={!isEdit && !!form.password} />
          </Field>
          <Field label="Role *">
            <select className={inputCls} value={form.role} onChange={(e) => set('role', e.target.value)} required>
              <option value="">--Select role--</option>
              {SYSTEM_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button type="button" onClick={() => router.push('/admin/system-users')} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {busy ? 'Saving…' : (isEdit ? 'Update User' : 'Add User')}
          </button>
        </div>
      </div>

      <PermissionsCard
        perms={perms}
        togglePerm={togglePerm}
        toggleColumn={toggleColumn}
        disabled={isSuperAdmin}
      />
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function PasswordInput({ value, onChange, show, onToggle, placeholder, required }) {
  return (
    <div className="relative">
      <input className={`${inputCls} pr-9`} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} autoComplete="new-password" />
      <button type="button" onClick={onToggle} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
        {show ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 10.587A2 2 0 0012 14a2 2 0 001.414-.586M9.88 4.273A9.96 9.96 0 0112 4c5.523 0 10 4.477 10 8 0 1.16-.49 2.4-1.359 3.61M6.21 6.21C4.32 7.61 3 9.66 3 12c0 3.523 4.477 8 10 8 1.61 0 3.143-.337 4.527-.943" /></svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" /><circle cx="12" cy="12" r="3" /></svg>
        )}
      </button>
    </div>
  );
}

function PermissionsCard({ perms, togglePerm, toggleColumn, disabled }) {
  const headerCls = 'px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500';
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
          Module Permissions
        </h2>
        {disabled && <span className="text-xs text-indigo-600 dark:text-indigo-300">Super Admin has all permissions by default.</span>}
      </div>
      <div className={`overflow-x-auto rounded-b-xl ${disabled ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Module / Permissions</th>
              {ALL_ACTIONS.map((a) => (
                <th key={a} className={headerCls}>
                  <button type="button" onClick={() => toggleColumn(a)} className="capitalize hover:text-indigo-600 dark:hover:text-indigo-300">{a}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {SYSTEM_MODULES.map((m) => (
              <tr key={m.key} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{m.label}</td>
                {ALL_ACTIONS.map((a) => (
                  <td key={a} className="px-3 py-2 text-center">
                    {m.actions.includes(a) ? (
                      <Toggle checked={perms[m.key]?.has(a) || false} onChange={(on) => togglePerm(m.key, a, on)} />
                    ) : <span className="text-slate-300 dark:text-slate-700">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  );
}

function normalizePerms(input) {
  const out = {};
  if (input && typeof input === 'object') {
    for (const [k, v] of Object.entries(input)) {
      if (Array.isArray(v)) out[k] = new Set(v);
    }
  }
  return out;
}

function serialize(perms) {
  const out = {};
  for (const [k, set] of Object.entries(perms)) {
    if (set instanceof Set && set.size) out[k] = Array.from(set);
  }
  return out;
}