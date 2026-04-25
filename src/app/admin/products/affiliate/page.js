import Link from 'next/link';
import { listAffiliateProducts } from '@/lib/repos/product-affiliate';
import { listCategoriesForFilter } from '@/lib/repos/product';
import TableToolbar from '@/components/admin/table-toolbar';
import AffiliateFilters from '@/components/admin/affiliate-filters';
import AffiliateBulk from '@/components/admin/affiliate-bulk';
import AffiliateRowToggle from '@/components/admin/affiliate-row-toggle';
import AffiliateRowActions from '@/components/admin/affiliate-row-actions';
import AffiliateSelectAll from '@/components/admin/affiliate-select-all';
import ProductImage from '@/components/admin/product-image';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'select', label: 'Select', defaultVisible: true },
  { key: 'id', label: 'ID', defaultVisible: false },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'brand', label: 'Brand', defaultVisible: false },
  { key: 'is_in_affiliate', label: 'Is In Affiliate', defaultVisible: true },
  { key: 'category', label: 'Category Name', defaultVisible: true },
  { key: 'actions', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function AffiliateProductsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    categoryId: sp?.categoryId || '',
    isInAffiliate: sp?.isInAffiliate || '',
  };

  const [{ rows, total, totalPages, page }, categories] = await Promise.all([
    listAffiliateProducts(filters),
    listCategoriesForFilter(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Affiliate Products</h1>
          <p className="mt-1 text-sm text-slate-500">Mark products as available for affiliates and update in bulk.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Affiliate Product Management</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Manage Affiliate Products
          </h2>
          <AffiliateBulk ids={rows.map((r) => r.id)} />
        </div>

        <div className="p-5">
          <AffiliateFilters categories={categories} />
        </div>

        <div data-affiliate-table>
          <TableToolbar
            title=""
            columns={COLUMNS}
            defaultVisible={DEFAULT_VISIBLE}
            tableAttr="data-affiliate-table"
            storageKey="admin.affiliate.cols.v1"
            exportFilename="affiliate-products"
          />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="select" className="px-5 py-3 w-10">
                    <AffiliateSelectAll />
                  </th>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="image" className="px-5 py-3">Image</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="brand" className="px-5 py-3">Brand</th>
                  <th data-col="is_in_affiliate" className="px-5 py-3 text-center">Is In Affiliate</th>
                  <th data-col="category" className="px-5 py-3">Category Name</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-500">No records available at the moment</td></tr>
                )}
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="select" className="px-5 py-3">
                      <input type="checkbox" data-bulk="aff-row" value={p.id} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" aria-label={`Select product ${p.id}`} />
                    </td>
                    <td data-col="id" className="px-5 py-3 text-center text-slate-500">{p.id}</td>
                    <td data-col="image" className="px-5 py-3"><ProductImage src={p.image} alt={p.name} /></td>
                    <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white max-w-[20rem] truncate" title={p.name}>{p.name}</td>
                    <td data-col="brand" className="px-5 py-3 text-slate-700 dark:text-slate-300">{p.brand_name || '—'}</td>
                    <td data-col="is_in_affiliate" className="px-5 py-3 text-center">
                      <AffiliateRowToggle id={p.id} value={!!p.is_in_affiliate} />
                    </td>
                    <td data-col="category" className="px-5 py-3 text-slate-700 dark:text-slate-300">{p.category_name || '—'}</td>
                    <td data-col="actions" className="px-5 py-3 text-center">
                      <AffiliateRowActions id={p.id} name={p.name} value={!!p.is_in_affiliate} />
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
    </div>
  );
}
