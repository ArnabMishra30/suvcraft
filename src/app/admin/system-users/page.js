import Link from 'next/link';
import { listSystemUsers } from '@/lib/repos/system-user';
import { ROLE_LABEL, ROLE_CLASS } from '@/lib/system-modules';
import { getSession } from '@/lib/auth/session';
import TableToolbar from '@/components/admin/table-toolbar';
import SystemUserRowActions from '@/components/admin/system-user-row-actions';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'username', label: 'Username', defaultVisible: true },
  { key: 'mobile', label: 'Mobile', defaultVisible: true },
  { key: 'email', label: 'Email', defaultVisible: true },
  { key: 'role', label: 'Role', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function SystemUsersPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
  };
  const [{ rows, total, totalPages, page }, session] = await Promise.all([
    listSystemUsers(filters),
    getSession(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage System Users</h1>
          <p className="mt-1 text-sm text-slate-500">Add, edit, and control module-level access for admin staff.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">System Users</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            System Users
          </h2>
          <Link href="/admin/system-users/new" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add System User
          </Link>
        </div>

        <div data-system-users-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-system-users-table" storageKey="admin.system-users.cols.v1" exportFilename="system-users" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="username" className="px-5 py-3">Username</th>
                  <th data-col="mobile" className="px-5 py-3">Mobile</th>
                  <th data-col="email" className="px-5 py-3">Email</th>
                  <th data-col="role" className="px-5 py-3">Role</th>
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
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{u.id}</td>
                    <td data-col="username" className="px-5 py-3 font-medium text-slate-900 dark:text-white capitalize">{u.username || '—'}</td>
                    <td data-col="mobile" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{u.mobile || '—'}</td>
                    <td data-col="email" className="px-5 py-3 text-slate-700 dark:text-slate-300">{u.email || '—'}</td>
                    <td data-col="role" className="px-5 py-3">
                      {u.role == null ? <span className="text-slate-400">—</span> : (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_CLASS[u.role] || ''}`}>{ROLE_LABEL[u.role] || `Role ${u.role}`}</span>
                      )}
                    </td>
                    <td data-col="actions" className="px-5 py-3 text-center">
                      <SystemUserRowActions row={u} currentUserId={session?.uid} />
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