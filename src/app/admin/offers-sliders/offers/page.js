import Link from 'next/link';
import { listOffers, OFFER_TYPE_LABEL } from '@/lib/repos/offer';
import { listCategoriesForSlider, listProductsForSlider } from '@/lib/repos/slider';
import { formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductImage from '@/components/admin/product-image';
import OfferFilters from '@/components/admin/offer-filters';
import { AddOfferButton, OfferRowActions } from '@/components/admin/offers-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'type', label: 'Type', defaultVisible: true },
  { key: 'type_id', label: 'Type ID', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'link', label: 'Link', defaultVisible: true },
  { key: 'created_at', label: 'Created At', defaultVisible: true },
  { key: 'action', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

const TYPE_BADGE = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  categories: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  products: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  offer_url: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
};

export default async function OffersPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    type: sp?.type || '',
  };

  const [{ rows, total, totalPages, page }, categories, products] = await Promise.all([
    listOffers(filters),
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Offers Management</h1>
          <p className="mt-1 text-sm text-slate-500">Promotional banners surfaced across the storefront.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Manage Offers</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Filters &amp; Search
          </h2>
        </div>
        <div className="p-5">
          <OfferFilters />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" /></svg>
            Offers
          </h2>
          <AddOfferButton categories={categories} products={products} />
        </div>

        <div data-offers-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-offers-table" storageKey="admin.offers.cols.v1" exportFilename="offers" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="type" className="px-5 py-3 text-center">Type</th>
                  <th data-col="type_id" className="px-5 py-3 text-center">Type ID</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="image" className="px-5 py-3 text-center">Image</th>
                  <th data-col="link" className="px-5 py-3">Link</th>
                  <th data-col="created_at" className="px-5 py-3 whitespace-nowrap">Created At</th>
                  <th data-col="action" className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{o.id}</td>
                    <td data-col="type" className="px-5 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[o.type] || ''}`}>
                        {OFFER_TYPE_LABEL[o.type] || o.type}
                      </span>
                    </td>
                    <td data-col="type_id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{o.type_id || '—'}</td>
                    <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white max-w-[18rem]">
                      <div className="line-clamp-2" title={o.name || ''}>{o.name || '—'}</div>
                    </td>
                    <td data-col="image" className="px-5 py-3 text-center">
                      {o.image ? <div className="inline-block"><ProductImage src={o.image} alt={`Offer ${o.id}`} /></div> : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td data-col="link" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[18rem]">
                      {o.link
                        ? <a href={o.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-500 truncate block" title={o.link}>{o.link}</a>
                        : <span className="text-slate-500">—</span>}
                    </td>
                    <td data-col="created_at" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(o.date_added)}</td>
                    <td data-col="action" className="px-5 py-3 text-center">
                      <OfferRowActions row={o} categories={categories} products={products} />
                    </td>
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