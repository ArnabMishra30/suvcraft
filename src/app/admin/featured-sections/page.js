import Link from 'next/link';
import { listSections } from '@/lib/repos/section';
import { listCategoriesForSlider, listProductsForSlider } from '@/lib/repos/slider';
import { FEATURED_PRODUCT_TYPE_LABEL, FEATURED_STYLE_LABEL } from '@/lib/featured-types';
import { formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import { ProductTypeFilter, AddFeaturedSectionButton, FeaturedSectionRowActions } from '@/components/admin/featured-sections-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'title', label: 'Title', defaultVisible: true },
  { key: 'short_description', label: 'Short Description', defaultVisible: true },
  { key: 'style', label: 'Style', defaultVisible: true },
  { key: 'categories', label: 'Categories', defaultVisible: true },
  { key: 'product_names', label: 'Product Names', defaultVisible: true },
  { key: 'product_type', label: 'Product Type', defaultVisible: true },
  { key: 'date', label: 'Date', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function FeaturedSectionsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    productType: sp?.productType || '',
  };

  const [{ rows, total, totalPages, page }, categories, products] = await Promise.all([
    listSections(filters),
    listCategoriesForSlider(),
    listProductsForSlider(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Featured Section <span className="text-base font-normal text-slate-500">(Show Products Exclusively)</span></h1>
          <p className="mt-1 text-sm text-slate-500">Curated product blocks that appear on the storefront home page.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Featured Section</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Manage Featured Section</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            Featured Section
          </h2>
          <AddFeaturedSectionButton categories={categories} products={products} />
        </div>

        <div className="p-5"><ProductTypeFilter /></div>

        <div data-featured-sections-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-featured-sections-table" storageKey="admin.featured-sections.cols.v1" exportFilename="featured-sections" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="title" className="px-5 py-3">Title</th>
                  <th data-col="short_description" className="px-5 py-3">Short Description</th>
                  <th data-col="style" className="px-5 py-3 text-center">Style</th>
                  <th data-col="categories" className="px-5 py-3">Categories</th>
                  <th data-col="product_names" className="px-5 py-3">Product Names</th>
                  <th data-col="product_type" className="px-5 py-3">Product Type</th>
                  <th data-col="date" className="px-5 py-3 whitespace-nowrap">Date</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
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
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{s.id}</td>
                    <td data-col="title" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{s.title}</td>
                    <td data-col="short_description" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[18rem]"><div className="line-clamp-2" title={s.short_description}>{s.short_description || '—'}</div></td>
                    <td data-col="style" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{FEATURED_STYLE_LABEL[s.style] || s.style}</td>
                    <td data-col="categories" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[16rem]"><div className="line-clamp-2" title={s.category_names.join(', ')}>{s.category_names.join(', ') || '—'}</div></td>
                    <td data-col="product_names" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[16rem]"><div className="line-clamp-2" title={s.product_names.join(', ')}>{s.product_names.join(', ') || '—'}</div></td>
                    <td data-col="product_type" className="px-5 py-3 text-slate-700 dark:text-slate-300">{FEATURED_PRODUCT_TYPE_LABEL[s.product_type] || s.product_type || '—'}</td>
                    <td data-col="date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(s.date_added)}</td>
                    <td data-col="actions" className="px-5 py-3 text-center"><FeaturedSectionRowActions row={s} categories={categories} products={products} /></td>
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