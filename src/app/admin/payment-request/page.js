import Link from 'next/link';
import { listPaymentRequests, STATUS_LABEL } from '@/lib/repos/payment-request';
import { getSettings } from '@/lib/settings';
import { formatCurrency, formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import PaymentRequestFilters from '@/components/admin/payment-request-filters';
import PaymentRequestRowActions from '@/components/admin/payment-request-row-actions';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'username', label: 'Username', defaultVisible: true },
  { key: 'type', label: 'Type', defaultVisible: true },
  { key: 'payment_address', label: 'Payment Address', defaultVisible: true },
  { key: 'amount', label: 'Amount Requested', defaultVisible: true },
  { key: 'remarks', label: 'Remarks', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'date', label: 'Date Created', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

const TYPE_BADGE = {
  customer: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  seller: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  delivery_boy: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  affiliate: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
};

const STATUS_BADGE = {
  0: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  2: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
};

export default async function PaymentRequestPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    userType: sp?.userType || '',
    status: sp?.status || '',
  };

  const [{ rows, total, totalPages, page }, sys] = await Promise.all([
    listPaymentRequests(filters),
    getSettings('system_settings').catch(() => null),
  ]);
  const currency = sys?.currency || 'INR';

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Payment Request</h1>
          <p className="mt-1 text-sm text-slate-500">Withdrawal requests submitted by customers, sellers, delivery boys and affiliates.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Payment Request</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Filters &amp; Search
          </h2>
        </div>
        <div className="p-5">
          <PaymentRequestFilters />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Manage Payment Request
          </h2>
        </div>

        <div data-payment-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-payment-table" storageKey="admin.payment.cols.v1" exportFilename="payment-requests" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="username" className="px-5 py-3">Username</th>
                  <th data-col="type" className="px-5 py-3 text-center">Type</th>
                  <th data-col="payment_address" className="px-5 py-3">Payment Address</th>
                  <th data-col="amount" className="px-5 py-3 text-right">Amount Requested</th>
                  <th data-col="remarks" className="px-5 py-3">Remarks</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="date" className="px-5 py-3 whitespace-nowrap">Date Created</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No matching records found
                    </div>
                  </td></tr>
                )}
                {rows.map((r) => {
                  const t = String(r.payment_type || '').toLowerCase();
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.id}</td>
                      <td data-col="username" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{r.username || `User #${r.user_id}`}</td>
                      <td data-col="type" className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_BADGE[t] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                          {t.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td data-col="payment_address" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[20rem]">
                        <div className="line-clamp-2 break-all" title={r.payment_address}>{r.payment_address || '—'}</div>
                      </td>
                      <td data-col="amount" className="px-5 py-3 text-right font-medium text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                        {formatCurrency(r.amount_requested, currency)}
                      </td>
                      <td data-col="remarks" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[18rem]">
                        <div className="line-clamp-2" title={r.remarks || ''}>{r.remarks || '—'}</div>
                      </td>
                      <td data-col="status" className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[Number(r.status)] || ''}`}>
                          {STATUS_LABEL[Number(r.status)] || '—'}
                        </span>
                      </td>
                      <td data-col="date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(r.date_created)}</td>
                      <td data-col="actions" className="px-5 py-3 text-center"><PaymentRequestRowActions row={r} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            <div>Showing {rows.length === 0 ? 0 : ((page - 1) * 20 + 1)} to {(page - 1) * 20 + rows.length} of {total} rows</div>
            {totalPages > 1 && (
              <div className="flex gap-2">
                {page > 1 && <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page - 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700">Previous</Link>}
                {page < totalPages && <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page + 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700">Next</Link>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}