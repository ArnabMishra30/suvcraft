import Link from 'next/link';
import { listSellers, sellerStatusLabel, sellerStatusBadgeClass } from '@/lib/repos/seller';
import { getSettings } from '@/lib/settings';
import { formatCurrency } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductImage from '@/components/admin/product-image';
import SellerRating from '@/components/admin/seller-rating';
import { SellerStatusFilter, UpdateCommissionButton, SellerRowActions } from '@/components/admin/sellers-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'email', label: 'Email', defaultVisible: true },
  { key: 'mobile', label: 'Mobile No', defaultVisible: true },
  { key: 'address', label: 'Address', defaultVisible: true },
  { key: 'balance', label: 'Balance(₹)', defaultVisible: true },
  { key: 'rating', label: 'Rating', defaultVisible: true },
  { key: 'store_name', label: 'Store Name', defaultVisible: true },
  { key: 'store_url', label: 'Store URL', defaultVisible: false },
  { key: 'store_description', label: 'Store Description', defaultVisible: false },
  { key: 'latitude', label: 'Latitude', defaultVisible: false },
  { key: 'longitude', label: 'Longitude', defaultVisible: false },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'categories', label: 'Categories', defaultVisible: false },
  { key: 'logo', label: 'Logo', defaultVisible: true },
  { key: 'address_proof', label: 'Address Proof', defaultVisible: false },
  { key: 'permissions', label: 'Permissions', defaultVisible: false },
  { key: 'date', label: 'Date', defaultVisible: false },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function SellersPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    status: sp?.status ?? '',
  };

  const [{ rows, total, totalPages, page }, sys] = await Promise.all([
    listSellers(filters),
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Seller</h1>
          <p className="mt-1 text-sm text-slate-500">Approve sellers, manage commissions and store details.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Sellers</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Manage Sellers
          </h2>
          <div className="flex items-center gap-2">
            <UpdateCommissionButton />
            <Link href="/admin/sellers/new" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Seller
            </Link>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="rounded-md bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 px-3 py-2 text-xs text-amber-800 dark:text-amber-300 inline-flex items-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
            <span><strong>Note:</strong> If you found seller commission not crediting using cron job you can update seller commission manually from here! (click on update seller commission button)</span>
          </div>
        </div>

        <div className="p-5">
          <SellerStatusFilter />
        </div>

        <div data-sellers-table>
          <TableToolbar
            title=""
            columns={COLUMNS}
            defaultVisible={DEFAULT_VISIBLE}
            tableAttr="data-sellers-table"
            storageKey="admin.sellers.cols.v1"
            exportFilename="sellers"
          />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="email" className="px-5 py-3">Email</th>
                  <th data-col="mobile" className="px-5 py-3">Mobile No</th>
                  <th data-col="address" className="px-5 py-3">Address</th>
                  <th data-col="balance" className="px-5 py-3 text-right">Balance(₹)</th>
                  <th data-col="rating" className="px-5 py-3">Rating</th>
                  <th data-col="store_name" className="px-5 py-3">Store Name</th>
                  <th data-col="store_url" className="px-5 py-3">Store URL</th>
                  <th data-col="store_description" className="px-5 py-3">Store Description</th>
                  <th data-col="latitude" className="px-5 py-3 text-right">Latitude</th>
                  <th data-col="longitude" className="px-5 py-3 text-right">Longitude</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="categories" className="px-5 py-3 text-center">Categories</th>
                  <th data-col="logo" className="px-5 py-3 text-center">Logo</th>
                  <th data-col="address_proof" className="px-5 py-3 text-center">Address Proof</th>
                  <th data-col="permissions" className="px-5 py-3">Permissions</th>
                  <th data-col="date" className="px-5 py-3 whitespace-nowrap">Date</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={19} className="px-5 py-12 text-center text-slate-500">No sellers found.</td></tr>
                )}
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{s.id}</td>
                    <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                    <td data-col="email" className="px-5 py-3 text-slate-700 dark:text-slate-300">{s.email}</td>
                    <td data-col="mobile" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{s.mobile}</td>
                    <td data-col="address" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[16rem] truncate" title={s.address || ''}>{s.address || '—'}</td>
                    <td data-col="balance" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(s.balance, currency)}</td>
                    <td data-col="rating" className="px-5 py-3"><SellerRating value={s.rating} count={s.no_of_ratings} /></td>
                    <td data-col="store_name" className="px-5 py-3 text-slate-700 dark:text-slate-300">{s.store_name || '—'}</td>
                    <td data-col="store_url" className="px-5 py-3 text-slate-500 text-xs max-w-[14rem] truncate" title={s.store_url || ''}>
                      {s.store_url ? <a href={s.store_url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-500">{s.store_url}</a> : '—'}
                    </td>
                    <td data-col="store_description" className="px-5 py-3 text-slate-500 max-w-[16rem] truncate" title={s.store_description || ''}>{s.store_description || '—'}</td>
                    <td data-col="latitude" className="px-5 py-3 text-right text-slate-500 tabular-nums text-xs">{s.latitude || '—'}</td>
                    <td data-col="longitude" className="px-5 py-3 text-right text-slate-500 tabular-nums text-xs">{s.longitude || '—'}</td>
                    <td data-col="status" className="px-5 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${sellerStatusBadgeClass(s.status)}`}>{sellerStatusLabel(s.status)}</span>
                    </td>
                    <td data-col="categories" className="px-5 py-3 text-center text-slate-500 text-xs" title={s.category_ids || ''}>
                      {(() => {
                        const ids = String(s.category_ids || '').split(',').map((x) => x.trim()).filter(Boolean);
                        return ids.length ? <span className="inline-flex px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium">{ids.length}</span> : '—';
                      })()}
                    </td>
                    <td data-col="logo" className="px-5 py-3 text-center">
                      {s.logo
                        ? <div className="inline-block"><ProductImage src={s.logo} alt={s.store_name || s.name} /></div>
                        : <span className="text-xs text-slate-400">NO IMAGE</span>}
                    </td>
                    <td data-col="address_proof" className="px-5 py-3 text-center">
                      {s.address_proof
                        ? <div className="inline-block"><ProductImage src={s.address_proof} alt="address proof" /></div>
                        : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td data-col="permissions" className="px-5 py-3 text-xs text-slate-500">
                      {(() => {
                        let p = {}; try { p = JSON.parse(s.permissions || '{}'); } catch {}
                        const flags = [];
                        if (p.require_product_approval) flags.push('Approval');
                        if (p.view_customer_details) flags.push('View Customers');
                        return flags.length ? flags.join(' · ') : '—';
                      })()}
                    </td>
                    <td data-col="date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{s.created_on ? new Date(s.created_on * 1000).toLocaleDateString() : '—'}</td>
                    <td data-col="actions" className="px-5 py-3 text-center"><SellerRowActions row={s} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            <div>Showing {rows.length === 0 ? 0 : ((page - 1) * 20 + 1)} to {(page - 1) * 20 + rows.length} of {total} rows</div>
            {totalPages > 1 && (
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page - 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Previous</Link>
                )}
                {page < totalPages && (
                  <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page + 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Next</Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}