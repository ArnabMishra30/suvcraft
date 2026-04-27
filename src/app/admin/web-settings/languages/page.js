import Link from 'next/link';
import { listLanguages } from '@/lib/repos/language';
import TableToolbar from '@/components/admin/table-toolbar';
import { AddLanguageButton, LanguageRowActions } from '@/components/admin/languages-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'language', label: 'Language', defaultVisible: true },
  { key: 'code', label: 'Code', defaultVisible: true },
  { key: 'is_rtl', label: 'Is RTL', defaultVisible: true },
  { key: 'is_default', label: 'Default', defaultVisible: true },
  { key: 'native_language', label: 'Native Language', defaultVisible: true },
  { key: 'action', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function LanguagesPage({ searchParams }) {
  const sp = await searchParams;
  const rows = await listLanguages({ search: sp?.q || '' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Languages</h1>
          <p className="mt-1 text-sm text-slate-500">Storefront and app interface languages.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Web Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Languages</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
            Manage Languages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto sm:min-w-[28rem]">
            <a href="/api/admin/languages/sample"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-4 py-2 text-sm font-semibold border border-sky-200 dark:border-sky-900">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
              Download Sample File
            </a>
            <AddLanguageButton />
          </div>
        </div>

        <div data-languages-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-languages-table" storageKey="admin.languages.cols.v1" exportFilename="languages" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="language" className="px-5 py-3">Language</th>
                  <th data-col="code" className="px-5 py-3">Code</th>
                  <th data-col="is_rtl" className="px-5 py-3 text-center">Is RTL</th>
                  <th data-col="is_default" className="px-5 py-3 text-center">Default</th>
                  <th data-col="native_language" className="px-5 py-3">Native Language</th>
                  <th data-col="action" className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No languages registered.
                    </div>
                  </td></tr>
                )}
                {rows.map((l) => {
                  const rtl = Number(l.is_rtl) === 1;
                  const isDefault = Number(l.is_default) === 1;
                  return (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{l.id}</td>
                      <td data-col="language" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{l.language}</td>
                      <td data-col="code" className="px-5 py-3 text-slate-700 dark:text-slate-300 font-mono text-xs">{l.code}</td>
                      <td data-col="is_rtl" className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          rtl ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>{rtl ? 'Yes' : 'No'}</span>
                      </td>
                      <td data-col="is_default" className="px-5 py-3 text-center">
                        {isDefault ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568L24 9.587l-6 5.847L19.336 24 12 19.897 4.664 24 6 15.434 0 9.587l8.332-1.432z" /></svg>
                            Default
                          </span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td data-col="native_language" className="px-5 py-3 text-slate-700 dark:text-slate-300">{l.native_language || '—'}</td>
                      <td data-col="action" className="px-5 py-3 text-center"><LanguageRowActions row={l} /></td>
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