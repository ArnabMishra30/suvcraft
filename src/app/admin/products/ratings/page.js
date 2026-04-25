import Link from 'next/link';
import { listProductRatings } from '@/lib/repos/product-rating';
import { listProductsForFilter } from '@/lib/repos/product-faq';
import TableToolbar from '@/components/admin/table-toolbar';
import { ProductRatingFilter, ProductRatingRowActions, StarRating } from '@/components/admin/product-ratings-client';
import ProductImage from '@/components/admin/product-image';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'product_id', label: 'Product ID', defaultVisible: true },
  { key: 'username', label: 'Username', defaultVisible: true },
  { key: 'product', label: 'Product Name', defaultVisible: true },
  { key: 'images', label: 'Images', defaultVisible: true },
  { key: 'rating', label: 'Rating', defaultVisible: true },
  { key: 'comment', label: 'Comment', defaultVisible: true },
  { key: 'date_added', label: 'Date Added', defaultVisible: true },
  { key: 'actions', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

function splitImages(s) {
  return String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
}

export default async function ProductRatingsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    productId: sp?.productId || '',
  };

  const [{ rows, total, totalPages, page }, products] = await Promise.all([
    listProductRatings(filters),
    listProductsForFilter(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Products Ratings</h1>
          <p className="mt-1 text-sm text-slate-500">Customer ratings and reviews for your products.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/products" className="hover:text-slate-700 dark:hover:text-slate-300">Products</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Product Ratings</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            Product Ratings
          </h2>
        </div>

        <div className="p-5">
          <ProductRatingFilter products={products} />
        </div>

        <div data-ratings-table>
          <TableToolbar
            title=""
            columns={COLUMNS}
            defaultVisible={DEFAULT_VISIBLE}
            tableAttr="data-ratings-table"
            storageKey="admin.ratings.cols.v1"
            exportFilename="product-ratings"
          />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="product_id" className="px-5 py-3 text-center">Product ID</th>
                  <th data-col="username" className="px-5 py-3">Username</th>
                  <th data-col="product" className="px-5 py-3">Product Name</th>
                  <th data-col="images" className="px-5 py-3">Images</th>
                  <th data-col="rating" className="px-5 py-3">Rating</th>
                  <th data-col="comment" className="px-5 py-3">Comment</th>
                  <th data-col="date_added" className="px-5 py-3 whitespace-nowrap">Date Added</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Action</th>
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
                {rows.map((r) => {
                  const imgs = splitImages(r.images);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.id}</td>
                      <td data-col="product_id" className="px-5 py-3 text-center text-slate-500">{r.product_id || '—'}</td>
                      <td data-col="username" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.username || '—'}</td>
                      <td data-col="product" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[16rem] truncate" title={r.product_name || ''}>
                        {r.product_name || <span className="text-slate-500 italic">(orphan)</span>}
                      </td>
                      <td data-col="images" className="px-5 py-3">
                        {imgs.length === 0 ? (
                          <span className="text-slate-500 text-xs">—</span>
                        ) : (
                          <div className="flex -space-x-2">
                            {imgs.slice(0, 3).map((src, i) => (
                              <div key={i} className="w-10 h-10 rounded-md ring-2 ring-white dark:ring-slate-900 overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <ProductImage src={src} alt="" />
                              </div>
                            ))}
                            {imgs.length > 3 && (
                              <div className="w-10 h-10 rounded-md ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-medium text-slate-700 dark:text-slate-300">
                                +{imgs.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td data-col="rating" className="px-5 py-3"><StarRating value={r.rating} /></td>
                      <td data-col="comment" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[20rem]">
                        {r.comment ? <div className="line-clamp-2" title={r.comment}>{r.comment}</div> : <span className="text-slate-500 text-xs">—</span>}
                      </td>
                      <td data-col="date_added" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {r.data_added ? new Date(r.data_added).toLocaleString() : '—'}
                      </td>
                      <td data-col="actions" className="px-5 py-3 text-center">
                        <ProductRatingRowActions id={r.id} />
                      </td>
                    </tr>
                  );
                })}
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