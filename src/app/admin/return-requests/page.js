import Link from 'next/link';
import { listReturnRequests, RETURN_STATUS } from '@/lib/repos/return-request';
import { listSellersForFilter } from '@/lib/repos/order';
import { listProductsForFilter } from '@/lib/repos/product-faq';
import { getSettings } from '@/lib/settings';
import { formatCurrency } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductImage from '@/components/admin/product-image';
import ReturnFilters from '@/components/admin/return-filters';
import ReturnRowActions from '@/components/admin/return-row-actions';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'order_id', label: 'Order ID', defaultVisible: true },
  { key: 'order_item_id', label: 'Order Item ID', defaultVisible: true },
  { key: 'username', label: 'Username', defaultVisible: true },
  { key: 'product_name', label: 'Product Name', defaultVisible: true },
  { key: 'variant_name', label: 'Variant Name', defaultVisible: true },
  { key: 'return_reason', label: 'Return Reason', defaultVisible: false },
  { key: 'return_item_image', label: 'Return Item Image', defaultVisible: true },
  { key: 'price', label: 'Price(₹)', defaultVisible: false },
  { key: 'seller_id', label: 'Seller ID', defaultVisible: false },
  { key: 'seller_name', label: 'Seller Name', defaultVisible: false },
  { key: 'quantity', label: 'Quantity', defaultVisible: true },
  { key: 'sub_total', label: 'Sub Total(₹)', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function ReturnRequestsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    status: sp?.status ?? '',
    sellerId: sp?.sellerId || '',
    productId: sp?.productId || '',
  };

  const [{ rows, total, totalPages, page }, sellers, products, sys] = await Promise.all([
    listReturnRequests(filters),
    listSellersForFilter(),
    listProductsForFilter(),
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">View Return Request</h1>
          <p className="mt-1 text-sm text-slate-500">Approve, pick up, or reject customer return requests.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/return-requests" className="hover:text-slate-700 dark:hover:text-slate-300">Return Request</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Manage Return Request</span>
        </nav>
      </div>

      <ReturnFilters sellers={sellers} products={products} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            Return request
          </h2>
        </div>

        <div data-returns-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-returns-table" storageKey="admin.returns.cols.v1" exportFilename="return-requests" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="order_id" className="px-5 py-3 text-center">Order ID</th>
                  <th data-col="order_item_id" className="px-5 py-3 text-center">Order Item ID</th>
                  <th data-col="username" className="px-5 py-3">Username</th>
                  <th data-col="product_name" className="px-5 py-3">Product Name</th>
                  <th data-col="variant_name" className="px-5 py-3">Variant Name</th>
                  <th data-col="return_reason" className="px-5 py-3">Return Reason</th>
                  <th data-col="return_item_image" className="px-5 py-3 text-center">Return Item Image</th>
                  <th data-col="price" className="px-5 py-3 text-right">Price({currency})</th>
                  <th data-col="seller_id" className="px-5 py-3 text-center">Seller ID</th>
                  <th data-col="seller_name" className="px-5 py-3">Seller Name</th>
                  <th data-col="quantity" className="px-5 py-3 text-center">Quantity</th>
                  <th data-col="sub_total" className="px-5 py-3 text-right">Sub Total({currency})</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={15} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((r) => {
                  const st = RETURN_STATUS[Number(r.status)] || { label: '—', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.id}</td>
                      <td data-col="order_id" className="px-5 py-3 text-center"><Link href={`/admin/orders/${r.order_id}`} className="text-indigo-600 hover:text-indigo-500 font-medium">#{r.order_id}</Link></td>
                      <td data-col="order_item_id" className="px-5 py-3 text-center text-slate-500">{r.order_item_id}</td>
                      <td data-col="username" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.username || `User #${r.user_id}`}</td>
                      <td data-col="product_name" className="px-5 py-3 font-medium text-slate-900 dark:text-white max-w-[16rem] truncate" title={r.product_name || ''}>{r.product_name || '—'}</td>
                      <td data-col="variant_name" className="px-5 py-3 text-slate-500">{r.variant_name && r.variant_name !== '0' ? r.variant_name : '—'}</td>
                      <td data-col="return_reason" className="px-5 py-3 text-slate-500 max-w-[16rem] truncate" title={r.return_reason || ''}>{r.return_reason || '—'}</td>
                      <td data-col="return_item_image" className="px-5 py-3 text-center">{r.return_item_image ? <div className="inline-block"><ProductImage src={r.return_item_image} alt="return image" /></div> : <span className="text-xs text-slate-400">—</span>}</td>
                      <td data-col="price" className="px-5 py-3 text-right text-slate-500 tabular-nums">{formatCurrency(r.discounted_price || r.price, currency)}</td>
                      <td data-col="seller_id" className="px-5 py-3 text-center text-slate-500">{r.seller_id || '—'}</td>
                      <td data-col="seller_name" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.seller_name || '—'}</td>
                      <td data-col="quantity" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.quantity || 0}</td>
                      <td data-col="sub_total" className="px-5 py-3 text-right font-medium text-slate-900 dark:text-white tabular-nums">{formatCurrency(r.sub_total, currency)}</td>
                      <td data-col="status" className="px-5 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                      <td data-col="actions" className="px-5 py-3 text-center"><ReturnRowActions id={r.id} /></td>
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