import Link from 'next/link';
import { listCustomerTransactions, listCustomersForFilter } from '@/lib/repos/customer';
import { getSettings } from '@/lib/settings';
import { formatCurrency, formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import CustomerTxnFilters from '@/components/admin/customer-txn-filters';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'username', label: 'User Name', defaultVisible: true },
  { key: 'order_id', label: 'Order ID', defaultVisible: true },
  { key: 'txn_id', label: 'Transaction ID', defaultVisible: true },
  { key: 'transaction_type', label: 'Transaction Type', defaultVisible: true },
  { key: 'pay_txn_id', label: 'Pay Transaction ID', defaultVisible: true },
  { key: 'amount', label: 'Amount', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'message', label: 'Message', defaultVisible: true },
  { key: 'date', label: 'Date', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

const STATUS_BADGE = {
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  awaiting: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  failed: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  refunded: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const STATUSES = [
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
];

const TXN_TYPES = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit', label: 'Credit' },
  { value: 'debit', label: 'Debit' },
  { value: 'cod', label: 'COD' },
  { value: 'phonepe', label: 'Phonepe' },
  { value: 'razorpay', label: 'Razorpay' },
  { value: 'stripe', label: 'Stripe' },
];

export default async function CustomerTransactionsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    userId: sp?.userId || '',
    status: sp?.status || '',
    txnType: sp?.txnType || '',
  };

  const [{ rows, total, totalPages, page }, customers, sys] = await Promise.all([
    listCustomerTransactions(filters),
    listCustomersForFilter(),
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">View Transaction</h1>
          <p className="mt-1 text-sm text-slate-500">Customer payment transactions.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/customers" className="hover:text-slate-700 dark:hover:text-slate-300">customer</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Customer Transaction</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h.01M11 15h2m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Transaction
          </h2>
        </div>

        <div className="p-5">
          <CustomerTxnFilters customers={customers} statuses={STATUSES} txnTypes={TXN_TYPES} />
        </div>

        <div data-cust-txn-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-cust-txn-table" storageKey="admin.cust-txn.cols.v1" exportFilename="customer-transactions" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="username" className="px-5 py-3">User Name</th>
                  <th data-col="order_id" className="px-5 py-3">Order ID</th>
                  <th data-col="txn_id" className="px-5 py-3">Transaction ID</th>
                  <th data-col="transaction_type" className="px-5 py-3">Transaction Type</th>
                  <th data-col="pay_txn_id" className="px-5 py-3">Pay Transaction ID</th>
                  <th data-col="amount" className="px-5 py-3 text-right">Amount</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="message" className="px-5 py-3">Message</th>
                  <th data-col="date" className="px-5 py-3 whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={10} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((t) => {
                  const sBadge = STATUS_BADGE[String(t.status || '').toLowerCase()] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{t.id}</td>
                      <td data-col="username" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{t.username || `User #${t.user_id}`}</td>
                      <td data-col="order_id" className="px-5 py-3 text-slate-700 dark:text-slate-300 font-mono text-xs">{t.order_id || '—'}</td>
                      <td data-col="txn_id" className="px-5 py-3 text-slate-700 dark:text-slate-300 font-mono text-xs max-w-[14rem] truncate" title={t.txn_id || ''}>{t.txn_id || '—'}</td>
                      <td data-col="transaction_type" className="px-5 py-3 text-xs uppercase text-slate-500">{t.transaction_type || '—'}</td>
                      <td data-col="pay_txn_id" className="px-5 py-3 text-slate-500 font-mono text-xs max-w-[14rem] truncate" title={t.payu_txn_id || ''}>{t.payu_txn_id || '—'}</td>
                      <td data-col="amount" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatCurrency(t.amount, t.currency_code || currency)}</td>
                      <td data-col="status" className="px-5 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sBadge}`}>{t.status || '—'}</span></td>
                      <td data-col="message" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[18rem] truncate" title={t.message || ''}>{t.message || '—'}</td>
                      <td data-col="date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(t.transaction_date || t.date_created)}</td>
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