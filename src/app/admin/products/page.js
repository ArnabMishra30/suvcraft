import Link from 'next/link';
import { listProducts, listCategoriesForFilter, listBrandsForFilter } from '@/lib/repos/product';
import { listSellersForFilter } from '@/lib/repos/order';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductsFilters from '@/components/admin/products-filters';
import ProductsBulk from '@/components/admin/products-bulk';
import ProductRowActions from '@/components/admin/product-row-actions';
import ProductsSelectAll from '@/components/admin/products-select-all';
import ProductImage from '@/components/admin/product-image';
import { productStatusLabel, productStatusBadge } from '@/lib/product-status';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'select', label: 'Select', defaultVisible: true },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'brand', label: 'Brand', defaultVisible: true },
  { key: 'category', label: 'Category Name', defaultVisible: true },
  { key: 'sku', label: 'SKU', defaultVisible: false },
  { key: 'stock', label: 'Stock', defaultVisible: false },
  { key: 'rating', label: 'Rating', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'actions', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    categoryId: sp?.categoryId || '',
    status: sp?.status || '',
    sellerId: sp?.sellerId || '',
    brandId: sp?.brandId || '',
  };

  const [{ rows, total, totalPages, page }, categories, brands, sellers] = await Promise.all([
    listProducts(filters),
    listCategoriesForFilter(),
    listBrandsForFilter(),
    listSellersForFilter(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Products</h1>
          <p className="mt-1 text-sm text-slate-500">Browse, filter, and manage your product catalog.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Products</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            Manage Products
          </h2>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Product
          </Link>
        </div>

        <div className="p-5 space-y-5">
          <ProductsFilters categories={categories} brands={brands} sellers={sellers} />
          <ProductsBulk ids={rows.map((r) => r.id)} />
        </div>

        <div data-products-table>
          <TableToolbar
            title=""
            columns={COLUMNS}
            defaultVisible={DEFAULT_VISIBLE}
            tableAttr="data-products-table"
            storageKey="admin.products.cols.v1"
            exportFilename="products-list"
          />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="select" className="px-5 py-3 w-10">
                    <ProductsSelectAll />
                  </th>
                  <th data-col="image" className="px-5 py-3">Image</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="brand" className="px-5 py-3">Brand</th>
                  <th data-col="category" className="px-5 py-3">Category Name</th>
                  <th data-col="sku" className="px-5 py-3">SKU</th>
                  <th data-col="stock" className="px-5 py-3 text-center">Stock</th>
                  <th data-col="rating" className="px-5 py-3 text-center">Rating</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="actions" className="px-5 py-3 text-right">Action</th>
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
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="select" className="px-5 py-3">
                      <input
                        type="checkbox"
                        data-bulk="row"
                        value={p.id}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        aria-label={`Select product ${p.id}`}
                      />
                    </td>
                    <td data-col="image" className="px-5 py-3">
                      <ProductImage src={p.image} alt={p.name} />
                    </td>
                    <td data-col="name" className="px-5 py-3">
                      <div className="font-medium text-slate-900 dark:text-white max-w-[20rem] truncate" title={p.name}>{p.name}</div>
                      {p.seller_name && <div className="text-xs text-slate-500">by {p.seller_name}</div>}
                    </td>
                    <td data-col="brand" className="px-5 py-3 text-slate-700 dark:text-slate-300">{p.brand_name || '—'}</td>
                    <td data-col="category" className="px-5 py-3 text-slate-700 dark:text-slate-300">{p.category_name || '—'}</td>
                    <td data-col="sku" className="px-5 py-3 text-slate-500 font-mono text-xs">{p.sku || p.product_identity || '—'}</td>
                    <td data-col="stock" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{p.stock ?? '—'}</td>
                    <td data-col="rating" className="px-5 py-3 text-center">
                      {p.no_of_ratings > 0
                        ? <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>{Number(p.rating || 0).toFixed(1)} <span className="text-xs text-slate-500">({p.no_of_ratings})</span></span>
                        : <span className="text-slate-500">—</span>}
                    </td>
                    <td data-col="status" className="px-5 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${productStatusBadge(p.status)}`}>
                        {productStatusLabel(p.status)}
                      </span>
                    </td>
                    <td data-col="actions" className="px-5 py-3 text-right">
                      <ProductRowActions id={p.id} status={Number(p.status)} />
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