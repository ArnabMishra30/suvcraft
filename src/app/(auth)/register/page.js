'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', country_code: '91', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.message || 'Registration failed.');
        return;
      }
      router.push(json.data?.redirect || '/account');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">It only takes a minute.</p>

      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
          <input id="name" type="text" autoComplete="name" required value={form.name} onChange={(e) => update('name', e.target.value)} className={inputCls} placeholder="Jane Doe" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className={inputCls} placeholder="you@example.com" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <label htmlFor="cc" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Code</label>
            <input id="cc" type="text" inputMode="numeric" pattern="[0-9]*" value={form.country_code} onChange={(e) => update('country_code', e.target.value.replace(/\D/g, ''))} className={inputCls} placeholder="91" />
          </div>
          <div className="col-span-2">
            <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mobile</label>
            <input id="mobile" type="tel" inputMode="numeric" autoComplete="tel" value={form.mobile} onChange={(e) => update('mobile', e.target.value.replace(/\D/g, ''))} className={inputCls} placeholder="9876543210" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
          <div className="relative mt-1">
            <input id="password" type={showPw ? 'text' : 'password'} autoComplete="new-password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} className={inputCls + ' pr-12 mt-0'} placeholder="At least 6 characters" />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</Link>
      </p>
    </div>
  );
}