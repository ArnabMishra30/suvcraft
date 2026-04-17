'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [identity, setIdentity] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.message || 'Could not process request.');
        return;
      }
      setMessage(json.message || 'If the account exists, reset instructions have been sent.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Forgot password</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Enter your email or mobile to receive reset instructions.</p>

      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      {message && (
        <div role="status" className="mt-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
          {message}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="identity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email or mobile</label>
          <input
            id="identity"
            type="text"
            required
            autoComplete="username"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="you@example.com"
          />
        </div>

        <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Sending…' : 'Send reset instructions'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Back to sign in</Link>
      </p>
    </div>
  );
}