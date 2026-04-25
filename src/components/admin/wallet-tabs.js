'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function WalletTabs() {
  const params = useSearchParams();
  const active = params.get('tab') === 'users' ? 'users' : 'wallet';

  function buildHref(tab) {
    const sp = new URLSearchParams(params);
    if (tab === 'users') {
      sp.set('tab', 'users');
      sp.delete('userId');
      sp.delete('status');
      sp.delete('txnType');
      sp.delete('page');
    } else {
      sp.set('tab', 'wallet');
      sp.delete('page');
    }
    return `?${sp.toString()}`;
  }

  return (
    <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-800">
      <Link href={buildHref('users')} className={`px-5 py-3 text-sm font-medium text-center inline-flex items-center justify-center gap-2 transition ${active === 'users' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 -mb-px bg-white dark:bg-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        Users
      </Link>
      <Link href={buildHref('wallet')} className={`px-5 py-3 text-sm font-medium text-center inline-flex items-center justify-center gap-2 transition ${active === 'wallet' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500 -mb-px bg-white dark:bg-slate-900' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        Customer Wallet Transactions
      </Link>
    </div>
  );
}