import Link from 'next/link';
import { listAttributeValues, listAttributesForFilter } from '@/lib/repos/attribute-value';
import TableToolbar from '@/components/admin/table-toolbar';
import { AddAttributeValueButton, AttributeValueRowActions } from '@/components/admin/attribute-values-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'attributes', label: 'Attributes', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'actions', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

const SWATCH_LABELS = { 0: 'Default', 1: 'Color', 2: 'Image' };

export default async function AttributeValuesPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    attributeId: sp?.attributeId || '',
  };

  const [{ rows, total, totalPages, page }, attributes] = await Promise.all([
    listAttributeValues(filters),
    listAttributesForFilter(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Attribute Value</h1>
          <p className="mt-1 text-sm text-slate-500">Define the actual values (Red, Small, etc.) that customers can choose for each attribute.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/products" className="hover:text-slate-700 dark:hover:text-slate-300">product</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Manage Attribute Value</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H18a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>
            Manage Attribute Values
          </h2>
          <AddAttributeValueButton attributes={attributes} />
        </div>

        <div data-attrvals-table>
          <TableToolbar
            title=""
            columns={COLUMNS}
            defaultVisible={DEFAULT_VISIBLE}
            tableAttr="data-attrvals-table"
            storageKey="admin.attrvals.cols.v1"
            exportFilename="attribute-values"
          />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="attributes" className="px-5 py-3">Attributes</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{v.id}</td>
                    <td data-col="attributes" className="px-5 py-3 text-slate-700 dark:text-slate-300">
                      {v.attribute_name ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-slate-500">{v.attribute_set_name || '—'}</span>
                          <span className="font-medium text-slate-900 dark:text-white">{v.attribute_name}</span>
                        </div>
                      ) : <span className="text-slate-500 italic">(orphan)</span>}
                    </td>
                    <td data-col="name" className="px-5 py-3">
                      <div className="inline-flex items-center gap-2">
                        {v.swatche_type === 1 && v.swatche_value && (
                          <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" style={{ background: v.swatche_value }} title={v.swatche_value} />
                        )}
                        {v.swatche_type === 2 && v.swatche_value && (
                          <img src={v.swatche_value.startsWith('http') || v.swatche_value.startsWith('/') ? v.swatche_value : `/${v.swatche_value}`} alt="" className="w-5 h-5 rounded object-cover" />
                        )}
                        <span className="font-medium text-slate-900 dark:text-white">{v.value}</span>
                        <span className="text-[10px] uppercase text-slate-500">{SWATCH_LABELS[v.swatche_type] || ''}</span>
                      </div>
                    </td>
                    <td data-col="status" className="px-5 py-3 text-center">
                      {v.status
                        ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Active</span>
                        : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Inactive</span>}
                    </td>
                    <td data-col="actions" className="px-5 py-3 text-center">
                      <AttributeValueRowActions row={v} attributes={attributes} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            <div>Showing {(rows.length === 0 ? 0 : (page - 1) * 20 + 1)} to {(page - 1) * 20 + rows.length} of {total.toLocaleString()} rows</div>
            {totalPages > 1 && (
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page - 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Previous</Link>
                )}
                {page < totalPages && (
                  <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page + 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Next</Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}