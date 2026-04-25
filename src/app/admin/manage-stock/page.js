import Link from 'next/link';
import {
  listProductsForStock,
  listSellersForStockFilter,
  listCategoriesForStockFilter,
} from '@/lib/repos/stock';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductImage from '@/components/admin/product-image';
import StockFilters from '@/components/admin/stock-filters';
import StockCell from '@/components/admin/stock-cell';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'product_id', label: 'Product ID', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'seller_name', label: 'Seller Name', defaultVisible: true },
  { key: 'category', label: 'Category', defaultVisible: true },
  { key: 'stock_type', label: 'Stock Type', defaultVisible: true },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'variants_stock', label: 'Variants - Stock', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

function StockTypeBadge({ type, hasVariants }) {
  const v = String(type || '').toLowerCase();
  if (hasVariants && (!v || v === '0')) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">Variant Wise</span>;
  }
  if (v.includes('unlimited')) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">Unlimited</span>;
  }
  if (v.includes('product')) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Product Wise</span>;
  }
  if (v.includes('variant')) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">Variant Wise</span>;
  }
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Standard</span>;
}

export default async function ManageStockPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    sellerId: sp?.sellerId || '',
    categoryId: sp?.categoryId || '',
  };

  const [{ rows, total, totalPages, page }, sellers, categories] = await Promise.all([
    listProductsForStock(filters),
    listSellersForStockFilter(),
    listCategoriesForStockFilter(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Products Stock</h1>
          <p className="mt-1 text-sm text-slate-500">Update stock levels per product or per variant.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Product Stock</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            Manage Products Stock
          </h2>
        </div>

        <div className="p-5">
          <StockFilters sellers={sellers} categories={categories} />
        </div>

        <div data-stock-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-stock-table" storageKey="admin.stock.cols.v1" exportFilename="manage-stock" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="product_id" className="px-5 py-3 text-center">Product ID</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="seller_name" className="px-5 py-3">Seller Name</th>
                  <th data-col="category" className="px-5 py-3">Category</th>
                  <th data-col="stock_type" className="px-5 py-3 text-center">Stock Type</th>
                  <th data-col="image" className="px-5 py-3 text-center">Image</th>
                  <th data-col="variants_stock" className="px-5 py-3">Variants - Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((p) => {
                  const hasVariants = p.variants?.length > 0;
                  const stockTypeStr = String(p.stock_type || '').toLowerCase();
                  const isUnlimited = stockTypeStr.includes('unlimited');
                  const useVariantStock = hasVariants && (!stockTypeStr || stockTypeStr.includes('variant'));
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 align-top">
                      <td data-col="product_id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{p.id}</td>
                      <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white max-w-[18rem]">
                        <div className="line-clamp-2" title={p.name}>{p.name}</div>
                      </td>
                      <td data-col="seller_name" className="px-5 py-3 text-slate-700 dark:text-slate-300">{p.seller_name || '—'}</td>
                      <td data-col="category" className="px-5 py-3 text-slate-700 dark:text-slate-300">{p.category_name || '—'}</td>
                      <td data-col="stock_type" className="px-5 py-3 text-center"><StockTypeBadge type={p.stock_type} hasVariants={hasVariants} /></td>
                      <td data-col="image" className="px-5 py-3 text-center">
                        {p.image ? <div className="inline-block"><ProductImage src={p.image} alt={p.name} /></div> : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td data-col="variants_stock" className="px-5 py-3">
                        {isUnlimited ? (
                          <span className="text-xs text-slate-500 italic">Unlimited</span>
                        ) : useVariantStock ? (
                          <div className="space-y-1.5">
                            {p.variants.map((v) => (
                              <div key={v.id} className="flex items-center justify-between gap-3">
                                <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[12rem]" title={v.label}>{v.label}</span>
                                <StockCell kind="variant" id={v.id} initial={v.stock} />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <StockCell kind="product" id={p.id} initial={p.stock} />
                        )}
                      </td>
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