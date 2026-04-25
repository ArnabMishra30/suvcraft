import Link from 'next/link';
import { listFundTransfers, listDeliveryBoysForFilter } from '@/lib/repos/delivery-boy';
import { getSettings } from '@/lib/settings';
import { formatCurrency, formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import FundTransferFilters from '@/components/admin/fund-transfer-filters';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'mobile', label: 'Mobile', defaultVisible: true },
  { key: 'opening_balance', label: 'Opening Balance', defaultVisible: true },
  { key: 'closing_balance', label: 'Closing Balance', defaultVisible: true },
  { key: 'amount', label: 'Amount', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'message', label: 'Message', defaultVisible: true },
  { key: 'date', label: 'Date', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

function statusBadgeClass(s) {
  const v = String(s || '').toLowerCase();
  if (v.includes('success') || v.includes('credit')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
  if (v.includes('debit') || v.includes('paid')) return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
  if (v.includes('pending') || v.includes('await')) return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

export default async function FundTransferPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    deliveryBoyId: sp?.deliveryBoyId || '',
  };

  const [{ rows, total, totalPages, page }, deliveryBoys, sys] = await Promise.all([
    listFundTransfers(filters),
    listDeliveryBoysForFilter(),
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">View Fund Transfers</h1>
          <p className="mt-1 text-sm text-slate-500">Money moved between admin and delivery boys.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/delivery-boys" className="hover:text-slate-700 dark:hover:text-slate-300">Delivery Boy</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Fund Transfers</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            Fund Transfers
          </h2>
        </div>

        <div className="p-5">
          <FundTransferFilters deliveryBoys={deliveryBoys} />
        </div>

        <div data-fund-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-fund-table" storageKey="admin.fund.cols.v1" exportFilename="fund-transfers" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="mobile" className="px-5 py-3">Mobile</th>
                  <th data-col="opening_balance" className="px-5 py-3 text-right">Opening Balance</th>
                  <th data-col="closing_balance" className="px-5 py-3 text-right">Closing Balance</th>
                  <th data-col="amount" className="px-5 py-3 text-right">Amount</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="message" className="px-5 py-3">Message</th>
                  <th data-col="date" className="px-5 py-3 whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{t.id}</td>
                    <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{t.name || `Boy #${t.delivery_boy_id}`}</td>
                    <td data-col="mobile" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{t.mobile || '—'}</td>
                    <td data-col="opening_balance" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatCurrency(t.opening_balance, currency)}</td>
                    <td data-col="closing_balance" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatCurrency(t.closing_balance, currency)}</td>
                    <td data-col="amount" className="px-5 py-3 text-right font-medium text-slate-900 dark:text-white tabular-nums whitespace-nowrap">{formatCurrency(t.amount, currency)}</td>
                    <td data-col="status" className="px-5 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(t.status)}`}>{t.status || '—'}</span></td>
                    <td data-col="message" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[24rem]"><div className="line-clamp-2" title={t.message || ''}>{t.message || '—'}</div></td>
                    <td data-col="date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(t.date_created)}</td>
                  </tr>
                ))}
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