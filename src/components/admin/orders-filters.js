'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ORDER_STATUSES } from '@/lib/repos/order-statuses';

const PAYMENT_METHODS = ['cod', 'razorpay', 'stripe', 'paytm', 'paypal', 'paystack', 'flutterwave', 'phonepe', 'instamojo', 'myfatoorah', 'midtrans', 'wallet', 'bank_transfer'];
const ORDER_TYPES = [
  { value: 'regular', label: 'Regular' },
  { value: 'pos', label: 'POS' },
  { value: 'shiprocket', label: 'Shiprocket' },
];

export default function OrdersFilters({ sellers = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [draft, setDraft] = useState({
    from: params.get('from') || '',
    to: params.get('to') || '',
    status: params.get('status') || '',
    paymentMethod: params.get('paymentMethod') || '',
    orderType: params.get('orderType') || '',
    sellerId: params.get('sellerId') || '',
    q: params.get('q') || '',
  });

  function update(k, v) {
    setDraft((d) => ({ ...d, [k]: v }));
  }

  function apply(e) {
    e?.preventDefault?.();
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(draft)) {
      if (v) sp.set(k, v);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }

  function reset() {
    setDraft({ from: '', to: '', status: '', paymentMethod: '', orderType: '', sellerId: '', q: '' });
    router.push(pathname);
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelCls = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Filters &amp; Search</h2>

      <form onSubmit={apply} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <div>
            <label htmlFor="q" className={labelCls}>Search</label>
            <input id="q" type="search" value={draft.q} onChange={(e) => update('q', e.target.value)} placeholder="ID, customer, mobile…" className={inputCls} />
          </div>

          <div>
            <label htmlFor="from" className={labelCls}>From date</label>
            <input id="from" type="date" value={draft.from} onChange={(e) => update('from', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label htmlFor="to" className={labelCls}>To date</label>
            <input id="to" type="date" value={draft.to} onChange={(e) => update('to', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label htmlFor="status" className={labelCls}>Status</label>
            <select id="status" value={draft.status} onChange={(e) => update('status', e.target.value)} className={inputCls}>
              <option value="">All Orders</option>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="paymentMethod" className={labelCls}>Payment method</label>
            <select id="paymentMethod" value={draft.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)} className={inputCls}>
              <option value="">All Methods</option>
              {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="orderType" className={labelCls}>Order type</label>
            <select id="orderType" value={draft.orderType} onChange={(e) => update('orderType', e.target.value)} className={inputCls}>
              <option value="">All Orders</option>
              {ORDER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label htmlFor="sellerId" className={labelCls}>Seller</label>
            <select id="sellerId" value={draft.sellerId} onChange={(e) => update('sellerId', e.target.value)} className={inputCls}>
              <option value="">All Sellers</option>
              {sellers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Filter
          </button>
          <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5m2 9a8 8 0 01-14 5" /></svg>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}