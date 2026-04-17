import Link from 'next/link';
import { listOrders, getOrderStatusCounts, listSellersForFilter } from '@/lib/repos/order';
import { getSettings } from '@/lib/settings';
import { formatCurrency, formatDate, statusBadgeClass } from '@/lib/format';
import OrdersStats from '@/components/admin/orders-stats';
import OrdersFilters from '@/components/admin/orders-filters';
import OrdersActionsBar from '@/components/admin/orders-actions-bar';
import TableToolbar from '@/components/admin/table-toolbar';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'Order ID', defaultVisible: true },
  { key: 'user_id', label: 'User ID', defaultVisible: false },
  { key: 'qty', label: 'Qty', defaultVisible: false },
  { key: 'customer', label: 'Customer', defaultVisible: true },
  { key: 'sellers', label: 'Sellers', defaultVisible: true },
  { key: 'mobile', label: 'Mobile', defaultVisible: false },
  { key: 'notes', label: 'Notes', defaultVisible: false },
  { key: 'items', label: 'Items', defaultVisible: true },
  { key: 'total', label: 'Total (₹)', defaultVisible: true },
  { key: 'delivery', label: 'Delivery (₹)', defaultVisible: false },
  { key: 'wallet', label: 'Wallet (₹)', defaultVisible: false },
  { key: 'discount', label: 'Discount (₹)', defaultVisible: false },
  { key: 'promo_code', label: 'Promo Code', defaultVisible: false },
  { key: 'final_total', label: 'Final Total (₹)', defaultVisible: true },
  { key: 'payment', label: 'Payment', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'date', label: 'Order Date', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function OrdersPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    status: sp?.status || '',
    search: sp?.q || '',
    paymentMethod: sp?.paymentMethod || '',
    orderType: sp?.orderType || '',
    sellerId: sp?.sellerId || '',
    from: sp?.from || '',
    to: sp?.to || '',
  };

  const [{ rows, total, totalPages, page }, counts, sellers, sys] = await Promise.all([
    listOrders(filters),
    getOrderStatusCounts(),
    listSellersForFilter(),
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Order Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and track all orders efficiently.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Orders</span>
        </nav>
      </div>

      <OrdersStats counts={counts} />
      <OrdersFilters sellers={sellers} />
      <OrdersActionsBar />

      <div data-orders-table className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <TableToolbar
          title="Orders List"
          columns={COLUMNS}
          defaultVisible={DEFAULT_VISIBLE}
          tableAttr="data-orders-table"
          storageKey="admin.orders.cols.v1"
          exportFilename="orders-list"
        />

        <div className="overflow-x-auto rounded-b-xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th data-col="id" className="px-5 py-3">Order ID</th>
                <th data-col="user_id" className="px-5 py-3">User ID</th>
                <th data-col="qty" className="px-5 py-3 text-center">Qty</th>
                <th data-col="customer" className="px-5 py-3">Customer</th>
                <th data-col="sellers" className="px-5 py-3">Sellers</th>
                <th data-col="mobile" className="px-5 py-3">Mobile</th>
                <th data-col="notes" className="px-5 py-3">Notes</th>
                <th data-col="items" className="px-5 py-3 text-center">Items</th>
                <th data-col="total" className="px-5 py-3 text-right">Total ({currency})</th>
                <th data-col="delivery" className="px-5 py-3 text-right">Delivery ({currency})</th>
                <th data-col="wallet" className="px-5 py-3 text-right">Wallet ({currency})</th>
                <th data-col="discount" className="px-5 py-3 text-right">Discount ({currency})</th>
                <th data-col="promo_code" className="px-5 py-3">Promo Code</th>
                <th data-col="final_total" className="px-5 py-3 text-right">Final Total ({currency})</th>
                <th data-col="payment" className="px-5 py-3">Payment</th>
                <th data-col="status" className="px-5 py-3">Status</th>
                <th data-col="date" className="px-5 py-3">Order Date</th>
                <th data-col="actions" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={18} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                  <td data-col="id" className="px-5 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    #{o.id}
                    {o.is_pos_order ? <span className="ml-2 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300">POS</span> : null}
                    {o.is_shiprocket_order ? <span className="ml-2 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">SR</span> : null}
                  </td>
                  <td data-col="user_id" className="px-5 py-3 text-slate-500">{o.user_id || '—'}</td>
                  <td data-col="qty" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{o.qty || 0}</td>
                  <td data-col="customer" className="px-5 py-3 text-slate-700 dark:text-slate-300">
                    {o.customer || '—'}
                    {o.customer_email && <div className="text-xs text-slate-500">{o.customer_email}</div>}
                  </td>
                  <td data-col="sellers" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[14rem] truncate" title={o.sellers || ''}>{o.sellers || '—'}</td>
                  <td data-col="mobile" className="px-5 py-3 text-slate-500">{o.mobile || '—'}</td>
                  <td data-col="notes" className="px-5 py-3 text-slate-500 max-w-[16rem] truncate" title={o.notes || ''}>{o.notes || '—'}</td>
                  <td data-col="items" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{o.items_count || 0}</td>
                  <td data-col="total" className="px-5 py-3 text-right text-slate-500 whitespace-nowrap">{formatCurrency(o.total, currency)}</td>
                  <td data-col="delivery" className="px-5 py-3 text-right text-slate-500 whitespace-nowrap">{formatCurrency(o.delivery_charge, currency)}</td>
                  <td data-col="wallet" className="px-5 py-3 text-right text-slate-500 whitespace-nowrap">{formatCurrency(o.wallet_balance, currency)}</td>
                  <td data-col="discount" className="px-5 py-3 text-right text-slate-500 whitespace-nowrap">{formatCurrency((Number(o.discount) || 0) + (Number(o.promo_discount) || 0), currency)}</td>
                  <td data-col="promo_code" className="px-5 py-3 text-slate-500 uppercase text-xs">{o.promo_code || '—'}</td>
                  <td data-col="final_total" className="px-5 py-3 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">{formatCurrency(o.final_total, currency)}</td>
                  <td data-col="payment" className="px-5 py-3 text-xs uppercase text-slate-500 whitespace-nowrap">
                    {o.payment_method || '—'}
                    {o.payment_method?.toLowerCase() === 'cod' && (
                      <span className={`ml-2 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${o.is_cod_collected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                        {o.is_cod_collected ? 'collected' : 'pending'}
                      </span>
                    )}
                  </td>
                  <td data-col="status" className="px-5 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(o.status)}`}>{o.status || '—'}</span></td>
                  <td data-col="date" className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(o.date_added)}</td>
                  <td data-col="actions" className="px-5 py-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-500 font-medium text-sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm">
            <div className="text-slate-500">Page {page} of {totalPages} · {total.toLocaleString()} total</div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page - 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Previous</Link>
              )}
              {page < totalPages && (
                <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page + 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Next</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}