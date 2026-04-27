import Link from 'next/link';
import { listSalesReport, PAYMENT_METHODS, ORDER_STATUSES, enabledPaymentMethods } from '@/lib/repos/sales-report';
import { listSellersForFilter } from '@/lib/repos/order';
import { getSettings } from '@/lib/settings';
import { formatCurrency, formatDate, statusBadgeClass } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import SalesReportFilters from '@/components/admin/sales-report-filters';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'item_id', label: 'Item ID', defaultVisible: true },
  { key: 'product_name', label: 'Product Name', defaultVisible: true },
  { key: 'final_total', label: 'Final Total', defaultVisible: true },
  { key: 'payment_method', label: 'Payment Method', defaultVisible: true },
  { key: 'store_name', label: 'Store Name', defaultVisible: true },
  { key: 'sales_representative', label: 'Sales Representative', defaultVisible: true },
  { key: 'order_date', label: 'Order Date', defaultVisible: true },
  { key: 'order_status', label: 'Order Status', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

const PAYMENT_LABEL = Object.fromEntries(PAYMENT_METHODS.map((p) => [p.value, p.label]));

export default async function SalesReportPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    from: sp?.from || '',
    to: sp?.to || '',
    paymentMethod: sp?.paymentMethod || '',
    status: sp?.status || '',
    sellerId: sp?.sellerId || '',
  };

  const [{ rows, total, totalValue, totalPages, page }, sellers, sys, paymentSettings] = await Promise.all([
    listSalesReport(filters),
    listSellersForFilter().catch(() => []),
    getSettings('system_settings').catch(() => null),
    getSettings('payment_method').catch(() => null),
  ]);
  const currency = sys?.currency || 'INR';
  const enabledMethods = enabledPaymentMethods(paymentSettings);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">View Sale Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Drill into individual order line items, filtered by date, gateway, status, and seller.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Reports</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Sales Reports</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Sale Report Details
          </h2>
          <div className="text-sm text-slate-700 dark:text-slate-300 inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="font-semibold">Total Order Value:</span>
            <span className="tabular-nums">{formatCurrency(totalValue, currency)}</span>
          </div>
        </div>

        <div className="p-5">
          <SalesReportFilters paymentMethods={enabledMethods} statuses={ORDER_STATUSES} sellers={sellers} />
        </div>

        <div data-sales-report-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-sales-report-table" storageKey="admin.sales-report.cols.v1" exportFilename="sales-report" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="item_id" className="px-5 py-3 text-center">Item ID</th>
                  <th data-col="product_name" className="px-5 py-3">Product Name</th>
                  <th data-col="final_total" className="px-5 py-3 text-right">Final Total ({currency === 'INR' ? '₹' : currency})</th>
                  <th data-col="payment_method" className="px-5 py-3">Payment Method</th>
                  <th data-col="store_name" className="px-5 py-3">Store Name</th>
                  <th data-col="sales_representative" className="px-5 py-3">Sales Representative</th>
                  <th data-col="order_date" className="px-5 py-3 whitespace-nowrap">Order Date</th>
                  <th data-col="order_status" className="px-5 py-3 text-center">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.item_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="item_id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.item_id}</td>
                    <td data-col="product_name" className="px-5 py-3 font-medium text-slate-900 dark:text-white max-w-[18rem]"><div className="line-clamp-2" title={r.product_name}>{r.product_name}</div></td>
                    <td data-col="final_total" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatCurrency(r.sub_total, currency)}</td>
                    <td data-col="payment_method" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{PAYMENT_LABEL[r.payment_method] || r.payment_method || '—'}</td>
                    <td data-col="store_name" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.store_name || '—'}</td>
                    <td data-col="sales_representative" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.sales_representative || '—'}</td>
                    <td data-col="order_date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(r.date_added)}</td>
                    <td data-col="order_status" className="px-5 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadgeClass(r.last_status)}`}>{(r.last_status || '—').replace(/_/g, ' ')}</span>
                    </td>
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