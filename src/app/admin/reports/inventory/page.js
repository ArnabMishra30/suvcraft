import Link from 'next/link';
import { listInventoryItems, getTopSellingProducts } from '@/lib/repos/inventory-report';
import { listSellersForFilter } from '@/lib/repos/order';
import TableToolbar from '@/components/admin/table-toolbar';
import InventoryReportFilters from '@/components/admin/inventory-report-filters';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'item_id', label: 'Item ID', defaultVisible: true },
  { key: 'product_name', label: 'Product Name', defaultVisible: true },
  { key: 'stock', label: 'Stock', defaultVisible: true },
  { key: 'orders_placed', label: 'Orders Placed', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function InventoryReportPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    from: sp?.from || '',
    to: sp?.to || '',
    sellerId: sp?.sellerId || '',
  };

  const [{ rows, total, totalPages, page }, top, sellers] = await Promise.all([
    listInventoryItems(filters),
    getTopSellingProducts({ from: filters.from, to: filters.to, sellerId: filters.sellerId, limit: 5 }).catch(() => []),
    listSellersForFilter().catch(() => []),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  const topMax = top.reduce((m, r) => Math.max(m, Number(r.total_qty || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">View Sale Inventory Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Track stock on hand against orders placed for the selected period and seller.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Reports</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Sales Inventory Reports</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
              Top Selling Products
            </h2>
          </div>
          <div className="p-5">
            {top.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500 inline-flex items-center justify-center gap-2 w-full">
                <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                No data available
              </div>
            ) : (
              <ul className="space-y-3">
                {top.map((p, i) => {
                  const qty = Number(p.total_qty || 0);
                  const pct = topMax ? Math.max(4, Math.round((qty / topMax) * 100)) : 0;
                  return (
                    <li key={`${p.product_id}-${i}`} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2" title={p.product_name}>{p.product_name || `#${p.product_id}`}</span>
                        <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">{qty} sold</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 12h12M10 20h4" /></svg>
              Filters
            </h2>
          </div>
          <div className="p-5">
            <InventoryReportFilters sellers={sellers} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            Sales Inventory Details
          </h2>
        </div>

        <div data-inventory-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-inventory-table" storageKey="admin.inventory-report.cols.v1" exportFilename="sales-inventory" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="item_id" className="px-5 py-3 text-center">Item ID</th>
                  <th data-col="product_name" className="px-5 py-3">Product Name</th>
                  <th data-col="stock" className="px-5 py-3 text-right">Stock</th>
                  <th data-col="orders_placed" className="px-5 py-3 text-right">Orders Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((r) => {
                  const isLow = r.stock < 10;
                  return (
                    <tr key={r.item_id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="item_id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.item_id}</td>
                      <td data-col="product_name" className="px-5 py-3 font-medium text-slate-900 dark:text-white max-w-[28rem]"><div className="line-clamp-2" title={r.product_name}>{r.product_name}</div></td>
                      <td data-col="stock" className={`px-5 py-3 text-right tabular-nums whitespace-nowrap ${isLow ? 'text-rose-600 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>{r.stock}</td>
                      <td data-col="orders_placed" className="px-5 py-3 text-right tabular-nums whitespace-nowrap text-slate-700 dark:text-slate-300">{r.orders_placed}</td>
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