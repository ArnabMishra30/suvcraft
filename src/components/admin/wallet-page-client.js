'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import TableToolbar from './table-toolbar';
import WalletFilters from './wallet-filters';
import { formatCurrency, formatDate } from '@/lib/format';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'user', label: 'User Name', defaultVisible: true },
  { key: 'type', label: 'Type', defaultVisible: true },
  { key: 'amount', label: 'Amount(₹)', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'message', label: 'Message', defaultVisible: true },
  { key: 'date', label: 'Date', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

const STATUS = {
  0: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  1: { label: 'Success', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  2: { label: 'Failed', cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
};

export default function WalletPageClient({ sellers, currency = 'INR' }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending] = useTransition();

  const [data, setData] = useState({ rows: [], total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setErr('');
    const sp = new URLSearchParams(params.toString());
    fetch(`/api/admin/wallet-transactions?${sp.toString()}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) { setErr(j.message || 'Load failed.'); return; }
        setData(j.data);
      })
      .catch(() => { if (!cancelled) setErr('Network error.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [params]);

  function gotoPage(p) {
    const sp = new URLSearchParams(params);
    sp.set('page', String(p));
    router.push(`${pathname}?${sp.toString()}`);
  }

  const showLoader = loading || isPending;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Seller Wallet Transactions
        </h2>
      </div>

      <div className="p-5">
        <WalletFilters sellers={sellers} />
      </div>

      <div data-wallet-table>
        <TableToolbar
          title=""
          columns={COLUMNS}
          defaultVisible={DEFAULT_VISIBLE}
          tableAttr="data-wallet-table"
          storageKey="admin.wallet.cols.v1"
          exportFilename="seller-wallet-transactions"
        />

        <div className={`overflow-x-auto rounded-b-xl relative ${showLoader ? 'min-h-[180px]' : ''}`}>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th data-col="id" className="px-5 py-3 text-center">ID</th>
                <th data-col="user" className="px-5 py-3">User Name</th>
                <th data-col="type" className="px-5 py-3">Type</th>
                <th data-col="amount" className="px-5 py-3 text-right">Amount({currency})</th>
                <th data-col="status" className="px-5 py-3 text-center">Status</th>
                <th data-col="message" className="px-5 py-3">Message</th>
                <th data-col="date" className="px-5 py-3 whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-slate-200 dark:divide-slate-800 ${showLoader ? 'opacity-30 pointer-events-none' : ''}`}>
              {!showLoader && data.rows.length === 0 && !err && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                    No records available at the moment
                  </div>
                </td></tr>
              )}
              {err && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-red-600">{err}</td></tr>
              )}
              {data.rows.map((t) => {
                const isCredit = String(t.type).toLowerCase().includes('credit') || Number(t.amount) > 0;
                const st = STATUS[Number(t.status)] || { label: '—', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{t.id}</td>
                    <td data-col="user" className="px-5 py-3 text-slate-700 dark:text-slate-300">
                      <div className="font-medium text-slate-900 dark:text-white">{t.username || `User #${t.user_id}`}</div>
                      {t.email && <div className="text-xs text-slate-500">{t.email}</div>}
                    </td>
                    <td data-col="type" className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isCredit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>
                        {t.type || (isCredit ? 'credit' : 'debit')}
                      </span>
                    </td>
                    <td data-col="amount" className={`px-5 py-3 text-right tabular-nums whitespace-nowrap font-medium ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isCredit ? '+' : '-'} {formatCurrency(Math.abs(Number(t.amount || 0)), currency)}
                    </td>
                    <td data-col="status" className="px-5 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td data-col="message" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[24rem]">
                      <div className="line-clamp-2" title={t.message || ''}>{t.message || '—'}</div>
                    </td>
                    <td data-col="date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(t.date_created)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {showLoader && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
              <svg className="w-6 h-6 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a8 8 0 0114-3m2 9a8 8 0 01-14 3" /></svg>
              <span className="text-xs text-slate-500">Loading…</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
          <div>
            {showLoader ? '…' : `Showing ${data.rows.length === 0 ? 0 : ((data.page - 1) * 20 + 1)} to ${(data.page - 1) * 20 + data.rows.length} of ${data.total} rows`}
          </div>
          {data.totalPages > 1 && (
            <div className="flex gap-2">
              <button type="button" disabled={data.page <= 1 || showLoader} onClick={() => gotoPage(data.page - 1)} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 disabled:opacity-40">Previous</button>
              <button type="button" disabled={data.page >= data.totalPages || showLoader} onClick={() => gotoPage(data.page + 1)} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}