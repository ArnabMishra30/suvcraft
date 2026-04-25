import Link from 'next/link';
import { listCountries } from '@/lib/repos/country';
import TableToolbar from '@/components/admin/table-toolbar';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'numeric_code', label: 'Numeric Code', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'capital', label: 'Capital', defaultVisible: true },
  { key: 'phonecode', label: 'Phonecode', defaultVisible: true },
  { key: 'currency', label: 'Currency', defaultVisible: true },
  { key: 'currency_name', label: 'Currency Name', defaultVisible: true },
  { key: 'currency_symbol', label: 'Currency Symbol', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function CountriesPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 25,
    search: sp?.q || '',
  };

  const { rows, total, totalPages, page } = await listCountries(filters);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Countries</h1>
          <p className="mt-1 text-sm text-slate-500">Reference data for country codes, currencies and dialing codes.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/location/pickup-locations" className="hover:text-slate-700 dark:hover:text-slate-300">Location</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Countries</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Countries
          </h2>
          <a href="/api/admin/countries/download" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
            Country Download file
          </a>
        </div>

        <div data-countries-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-countries-table" storageKey="admin.countries.cols.v1" exportFilename="countries" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="numeric_code" className="px-5 py-3">Numeric Code</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="capital" className="px-5 py-3">Capital</th>
                  <th data-col="phonecode" className="px-5 py-3">Phonecode</th>
                  <th data-col="currency" className="px-5 py-3">Currency</th>
                  <th data-col="currency_name" className="px-5 py-3">Currency Name</th>
                  <th data-col="currency_symbol" className="px-5 py-3">Currency Symbol</th>
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
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.id}</td>
                    <td data-col="numeric_code" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.numeric_code || '—'}</td>
                    <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{r.name}</td>
                    <td data-col="capital" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.capital || '—'}</td>
                    <td data-col="phonecode" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.phonecode || '—'}</td>
                    <td data-col="currency" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.currency || '—'}</td>
                    <td data-col="currency_name" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.currency_name || '—'}</td>
                    <td data-col="currency_symbol" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.currency_symbol || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            <div>Showing {rows.length === 0 ? 0 : ((page - 1) * 25 + 1)} to {(page - 1) * 25 + rows.length} of {total} rows</div>
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