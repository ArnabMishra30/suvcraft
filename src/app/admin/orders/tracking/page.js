import Link from 'next/link';
import { listTracking } from '@/lib/repos/order-tracking';
import { formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import TrackingAddForm from '@/components/admin/tracking-add-form';
import TrackingRowActions from '@/components/admin/tracking-row-actions';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'order_id', label: 'Order ID', defaultVisible: true },
  { key: 'order_item_id', label: 'Order Item ID', defaultVisible: true },
  { key: 'courier_agency', label: 'Courier Agency', defaultVisible: true },
  { key: 'tracking_id', label: 'Tracking ID', defaultVisible: true },
  { key: 'url', label: 'URL', defaultVisible: true },
  { key: 'awb_code', label: 'AWB Code', defaultVisible: false },
  { key: 'is_canceled', label: 'Cancelled', defaultVisible: false },
  { key: 'date', label: 'Date', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function OrderTrackingPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
  };

  const { rows, total, totalPages, page } = await listTracking(filters);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Order Tracking</h1>
          <p className="mt-1 text-sm text-slate-500">Manage courier tracking IDs for outgoing shipments.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/orders" className="hover:text-slate-700 dark:hover:text-slate-300">Orders</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Order Tracking</span>
        </nav>
      </div>

      <TrackingAddForm />

      <div data-tracking-table className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <TableToolbar
          title="Order Tracking"
          columns={COLUMNS}
          defaultVisible={DEFAULT_VISIBLE}
          tableAttr="data-tracking-table"
          storageKey="admin.tracking.cols.v1"
          exportFilename="order-tracking-list"
        />

        <div className="overflow-x-auto rounded-b-xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th data-col="id" className="px-5 py-3 text-center">ID</th>
                <th data-col="order_id" className="px-5 py-3 text-center">Order ID</th>
                <th data-col="order_item_id" className="px-5 py-3 text-center">Order Item ID</th>
                <th data-col="courier_agency" className="px-5 py-3 text-center">Courier Agency</th>
                <th data-col="tracking_id" className="px-5 py-3 text-center">Tracking ID</th>
                <th data-col="url" className="px-5 py-3 text-center">URL</th>
                <th data-col="awb_code" className="px-5 py-3 text-center">AWB Code</th>
                <th data-col="is_canceled" className="px-5 py-3 text-center">Cancelled</th>
                <th data-col="date" className="px-5 py-3 text-center">Date</th>
                <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                  <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{t.id}</td>
                  <td data-col="order_id" className="px-5 py-3 text-center">
                    <Link href={`/admin/orders/${t.order_id}`} className="text-indigo-600 hover:text-indigo-500 font-medium">#{t.order_id}</Link>
                  </td>
                  <td data-col="order_item_id" className="px-5 py-3 text-center text-slate-500">{t.order_item_id || '—'}</td>
                  <td data-col="courier_agency" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{t.courier_agency || '—'}</td>
                  <td data-col="tracking_id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300 font-mono text-xs">{t.tracking_id || '—'}</td>
                  <td data-col="url" className="px-5 py-3 text-center max-w-[14rem] truncate">
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500 text-xs" title={t.url}>
                        Open ↗
                      </a>
                    ) : <span className="text-slate-500">—</span>}
                  </td>
                  <td data-col="awb_code" className="px-5 py-3 text-center text-slate-500 font-mono text-xs">{t.awb_code || '—'}</td>
                  <td data-col="is_canceled" className="px-5 py-3 text-center">
                    {t.is_canceled
                      ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">Cancelled</span>
                      : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Active</span>
                    }
                  </td>
                  <td data-col="date" className="px-5 py-3 text-center text-slate-500 whitespace-nowrap">{formatDate(t.date_created)}</td>
                  <td data-col="actions" className="px-5 py-3 text-center">
                    <TrackingRowActions id={t.id} />
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