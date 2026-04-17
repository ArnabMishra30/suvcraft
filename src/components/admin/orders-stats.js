'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const CARDS = [
  { key: 'awaiting',   label: 'Awaiting',     sub: 'Pending orders',     accent: 'text-emerald-600 dark:text-emerald-400', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'received',   label: 'Received',     sub: 'Confirmed orders',   accent: 'text-emerald-600 dark:text-emerald-400', icon: 'M5 13l4 4L19 7' },
  { key: 'processed',  label: 'Processed',    sub: 'In preparation',     accent: 'text-amber-600 dark:text-amber-400',     icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'shipped',    label: 'Shipped',      sub: 'In transit',         accent: 'text-amber-600 dark:text-amber-400',     icon: 'M3 8h11v7H3V8zm11 3h4l3 3v4h-7v-7zM7 19a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z' },
  { key: 'delivered',  label: 'Delivered',    sub: 'Completed orders',   accent: 'text-emerald-600 dark:text-emerald-400', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'cancelled',  label: 'Cancelled',    sub: 'Cancelled orders',   accent: 'text-red-600 dark:text-red-400',         icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'returned',   label: 'Returned',     sub: 'Returned orders',    accent: 'text-slate-600 dark:text-slate-400',     icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
  { key: 'total',      label: 'Total Orders', sub: 'All time',           accent: 'text-indigo-600 dark:text-indigo-400',   icon: 'M3 3v18h18M7 14l4-4 4 4 5-5' },
];

export default function OrdersStats({ counts }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeStatus = params.get('status') || '';

  function goto(key) {
    const sp = new URLSearchParams(params);
    if (key === 'total') sp.delete('status');
    else if (activeStatus === key) sp.delete('status');
    else sp.set('status', key);
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
      {CARDS.map((c) => {
        const active = (c.key === 'total' && !activeStatus) || activeStatus === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => goto(c.key)}
            className={`text-left bg-white dark:bg-slate-900 rounded-xl border p-4 transition hover:shadow-md hover:-translate-y-0.5 ${
              active
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{c.label}</div>
              <svg className={`w-5 h-5 flex-shrink-0 ${c.accent}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
              </svg>
            </div>
            <div className="mt-1 text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {(counts[c.key] ?? 0).toLocaleString()}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">{c.sub}</div>
          </button>
        );
      })}
    </div>
  );
}