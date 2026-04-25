import Link from 'next/link';
import { listReturnReasons } from '@/lib/repos/return-request';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductImage from '@/components/admin/product-image';
import { AddReturnReasonButton, ReturnReasonRowActions } from '@/components/admin/return-reasons-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'reason', label: 'Return Reason', defaultVisible: true },
  { key: 'message', label: 'Message', defaultVisible: true },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'date', label: 'Created', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function ReturnReasonsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
  };

  const { rows, total, totalPages, page } = await listReturnReasons(filters);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Reasons For Return</h1>
          <p className="mt-1 text-sm text-slate-500">Reasons customers can pick when requesting a return.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/return-requests" className="hover:text-slate-700 dark:hover:text-slate-300">Return Request</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Reasons</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Reasons
          </h2>
          <AddReturnReasonButton />
        </div>

        <div data-reasons-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-reasons-table" storageKey="admin.reasons.cols.v1" exportFilename="return-reasons" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="reason" className="px-5 py-3">Return Reason</th>
                  <th data-col="message" className="px-5 py-3">Message</th>
                  <th data-col="image" className="px-5 py-3 text-center">Image</th>
                  <th data-col="date" className="px-5 py-3 whitespace-nowrap">Created</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.id}</td>
                    <td data-col="reason" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{r.return_reason}</td>
                    <td data-col="message" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[24rem]">{r.message || '—'}</td>
                    <td data-col="image" className="px-5 py-3 text-center">{r.image ? <div className="inline-block"><ProductImage src={r.image} alt={r.return_reason} /></div> : <span className="text-xs text-slate-400">—</span>}</td>
                    <td data-col="date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}</td>
                    <td data-col="actions" className="px-5 py-3 text-center"><ReturnReasonRowActions row={r} /></td>
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