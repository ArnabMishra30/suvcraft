'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');

  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, password }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.message || 'Login failed.');
        return;
      }
      router.push(next || json.data?.redirect || '/');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Login with your email or mobile number.</p>

      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="identity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Email or mobile
          </label>
          <input
            id="identity"
            name="identity"
            type="text"
            autoComplete="username"
            required
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 pr-12 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Create one
        </Link>
      </p>
    </div>
  );
}