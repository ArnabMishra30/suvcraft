import Link from 'next/link';
import { listCategories, listAllCategoriesForTree, listAllCategoriesForParentSelect } from '@/lib/repos/category';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductImage from '@/components/admin/product-image';
import {
  ViewToggle,
  AddCategoryButton,
  CategoryStatusFilter,
  CategoryRowActions,
  CategoryTree,
} from '@/components/admin/categories-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'parent', label: 'Parent', defaultVisible: false },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'actions', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function CategoriesPage({ searchParams }) {
  const sp = await searchParams;
  const view = sp?.view === 'tree' ? 'tree' : 'list';
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    status: sp?.status || '',
  };

  const [listed, treeRows, parents] = await Promise.all([
    view === 'list' ? listCategories(filters) : Promise.resolve(null),
    view === 'tree' ? listAllCategoriesForTree() : Promise.resolve(null),
    listAllCategoriesForParentSelect(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Category</h1>
          <p className="mt-1 text-sm text-slate-500">Organize products into categories and subcategories.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Category</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14-7H5m14 14H5" /></svg>
            Manage Category
          </h2>
          <div className="flex items-center gap-2">
            <ViewToggle />
            <AddCategoryButton parents={parents} />
          </div>
        </div>

        {view === 'list' && (
          <>
            <div className="p-5">
              <CategoryStatusFilter />
            </div>
            <div data-cats-table>
              <TableToolbar
                title=""
                columns={COLUMNS}
                defaultVisible={DEFAULT_VISIBLE}
                tableAttr="data-cats-table"
                storageKey="admin.cats.cols.v1"
                exportFilename="categories"
              />
              <div className="overflow-x-auto rounded-b-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th data-col="id" className="px-5 py-3 text-center">ID</th>
                      <th data-col="name" className="px-5 py-3">Name</th>
                      <th data-col="image" className="px-5 py-3 text-center">Image</th>
                      <th data-col="parent" className="px-5 py-3">Parent</th>
                      <th data-col="status" className="px-5 py-3 text-center">Status</th>
                      <th data-col="actions" className="px-5 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {listed.rows.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                        <div className="inline-flex items-center gap-2">
                          <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                          No records available at the moment
                        </div>
                      </td></tr>
                    )}
                    {listed.rows.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                        <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{c.id}</td>
                        <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{c.name}</td>
                        <td data-col="image" className="px-5 py-3"><div className="inline-block"><ProductImage src={c.image} alt={c.name} /></div></td>
                        <td data-col="parent" className="px-5 py-3 text-slate-500">{c.parent_name || '—'}</td>
                        <td data-col="status" className="px-5 py-3 text-center">
                          {c.status
                            ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Active</span>
                            : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Inactive</span>}
                        </td>
                        <td data-col="actions" className="px-5 py-3 text-center">
                          <CategoryRowActions row={c} parents={parents} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
                <div>Showing {listed.rows.length === 0 ? 0 : ((listed.page - 1) * listed.perPage + 1)} to {(listed.page - 1) * listed.perPage + listed.rows.length} of {listed.total} rows</div>
                {listed.totalPages > 1 && (
                  <div className="flex gap-2">
                    {listed.page > 1 && (
                      <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(listed.page - 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Previous</Link>
                    )}
                    {listed.page < listed.totalPages && (
                      <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(listed.page + 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Next</Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {view === 'tree' && (
          <div className="p-5">
            {treeRows.length === 0 ? (
              <div className="text-center text-slate-500 py-12 inline-flex items-center gap-2 w-full justify-center">
                <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                No categories yet.
              </div>
            ) : (
              <CategoryTree rows={treeRows} parents={parents} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}