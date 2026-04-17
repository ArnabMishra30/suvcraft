import Link from 'next/link';
import { listSystemNotifications } from '@/lib/repos/system-notification';
import { formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import NotificationsControls from '@/components/admin/notifications-controls';
import NotificationRowActions from '@/components/admin/notification-row-actions';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'title', label: 'Title', defaultVisible: true },
  { key: 'message', label: 'Message', defaultVisible: true },
  { key: 'type', label: 'Type', defaultVisible: true },
  { key: 'type_id', label: 'Type ID', defaultVisible: true },
  { key: 'date', label: 'Date', defaultVisible: false },
  { key: 'read_by', label: 'Read By', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function SystemNotificationsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    readBy: sp?.readBy || '',
  };

  const { rows, total, totalPages, page } = await listSystemNotifications(filters);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">System Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">Internal admin alerts (orders, payouts, system events).</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">System Notifications</span>
        </nav>
      </div>

      <NotificationsControls />

      <div data-notifications-table className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <TableToolbar
          title="Notifications"
          columns={COLUMNS}
          defaultVisible={DEFAULT_VISIBLE}
          tableAttr="data-notifications-table"
          storageKey="admin.notifications.cols.v1"
          exportFilename="system-notifications"
        />

        <div className="overflow-x-auto rounded-b-xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th data-col="id" className="px-5 py-3 text-center">ID</th>
                <th data-col="title" className="px-5 py-3">Title</th>
                <th data-col="message" className="px-5 py-3">Message</th>
                <th data-col="type" className="px-5 py-3">Type</th>
                <th data-col="type_id" className="px-5 py-3 text-center">Type ID</th>
                <th data-col="date" className="px-5 py-3">Date</th>
                <th data-col="read_by" className="px-5 py-3 text-center">Read By</th>
                <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td>
                </tr>
              )}
              {rows.map((n) => (
                <tr key={n.id} className={`hover:bg-slate-50 dark:hover:bg-slate-950/50 ${n.read_by ? '' : 'bg-indigo-50/40 dark:bg-indigo-950/20'}`}>
                  <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{n.id}</td>
                  <td data-col="title" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{n.title || '—'}</td>
                  <td data-col="message" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[28rem]">{n.message || '—'}</td>
                  <td data-col="type" className="px-5 py-3">
                    {n.type
                      ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{n.type}</span>
                      : <span className="text-slate-500">—</span>}
                  </td>
                  <td data-col="type_id" className="px-5 py-3 text-center text-slate-500 font-mono text-xs">{n.type_id || '—'}</td>
                  <td data-col="date" className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(n.date_sent)}</td>
                  <td data-col="read_by" className="px-5 py-3 text-center">
                    {n.read_by
                      ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Read</span>
                      : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Unread</span>
                    }
                  </td>
                  <td data-col="actions" className="px-5 py-3 text-center">
                    <NotificationRowActions id={n.id} readBy={!!n.read_by} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm">
            <div className="text-slate-500">Page {page} of {totalPages} · {total.toLocaleString()} total</div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page - 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Previous</Link>
              )}
              {page < totalPages && (
                <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page + 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Next</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}