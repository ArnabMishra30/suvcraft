import Link from 'next/link';
import { listCustomers } from '@/lib/repos/customer';
import { getSettings } from '@/lib/settings';
import { formatCurrency } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import CustomerStatusFilter from '@/components/admin/customer-status-filter';
import CustomerRowActions from '@/components/admin/customer-row-actions';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'email', label: 'Email', defaultVisible: true },
  { key: 'mobile', label: 'Mobile No', defaultVisible: true },
  { key: 'balance', label: 'Balance(₹)', defaultVisible: true },
  { key: 'date', label: 'Date', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function CustomersPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    status: sp?.status ?? '',
  };

  const [{ rows, total, totalPages, page }, sys] = await Promise.all([
    listCustomers(filters),
    getSettings('system_settings').catch(() => null),
  ]);
  const currency = sys?.currency || 'INR';

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">View Customers</h1>
          <p className="mt-1 text-sm text-slate-500">All registered customers.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Customers</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Customers
          </h2>
        </div>

        <div className="p-5">
          <CustomerStatusFilter />
        </div>

        <div data-customers-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-customers-table" storageKey="admin.customers.cols.v1" exportFilename="customers" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="email" className="px-5 py-3">Email</th>
                  <th data-col="mobile" className="px-5 py-3">Mobile No</th>
                  <th data-col="balance" className="px-5 py-3 text-right">Balance({currency})</th>
                  <th data-col="date" className="px-5 py-3 whitespace-nowrap">Date</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
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
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{c.id}</td>
                    <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{c.name || '—'}</td>
                    <td data-col="email" className="px-5 py-3 text-slate-700 dark:text-slate-300">{c.email || '—'}</td>
                    <td data-col="mobile" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{c.mobile || '—'}</td>
                    <td data-col="balance" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(c.balance, currency)}</td>
                    <td data-col="date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{c.created_on ? new Date(c.created_on * 1000).toLocaleDateString() : '—'}</td>
                    <td data-col="status" className="px-5 py-3 text-center">
                      {c.status
                        ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Active</span>
                        : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Inactive</span>}
                    </td>
                    <td data-col="actions" className="px-5 py-3 text-center"><CustomerRowActions row={c} /></td>
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