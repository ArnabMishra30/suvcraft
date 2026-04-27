import Link from 'next/link';
import { listThemes } from '@/lib/repos/theme';
import { formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductImage from '@/components/admin/product-image';
import ThemeRowActions from '@/components/admin/theme-row-actions';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'is_default', label: 'Default', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'created_on', label: 'Created On', defaultVisible: true },
  { key: 'action', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function ThemesPage({ searchParams }) {
  const sp = await searchParams;
  const rows = await listThemes({ search: sp?.q || '' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Themes</h1>
          <p className="mt-1 text-sm text-slate-500">Pick which storefront theme is currently live.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Web Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Themes</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
            Manage Themes
          </h2>
        </div>

        <div data-themes-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-themes-table" storageKey="admin.themes.cols.v1" exportFilename="themes" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="image" className="px-5 py-3">Image</th>
                  <th data-col="is_default" className="px-5 py-3 text-center">Default</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="created_on" className="px-5 py-3 whitespace-nowrap">Created On</th>
                  <th data-col="action" className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No themes registered.
                    </div>
                  </td></tr>
                )}
                {rows.map((t) => {
                  const isDefault = Number(t.is_default) === 1;
                  const active = Number(t.status) === 1;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{t.id}</td>
                      <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{t.name}</td>
                      <td data-col="image" className="px-5 py-3">
                        {t.image
                          ? <div className="inline-block"><ProductImage src={t.image} alt={t.name} /></div>
                          : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td data-col="is_default" className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          isDefault
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>{isDefault ? 'Yes' : 'No'}</span>
                      </td>
                      <td data-col="status" className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>{active ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td data-col="created_on" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(t.created_on)}</td>
                      <td data-col="action" className="px-5 py-3 text-center"><ThemeRowActions row={t} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            <div>Showing 1 to {rows.length} of {rows.length} rows</div>
          </div>
        </div>
      </div>
    </div>
  );
}