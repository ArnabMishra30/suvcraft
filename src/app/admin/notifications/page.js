import Link from 'next/link';
import { listNotifications, NOTIFICATION_TYPE_LABEL, SEND_TO_LABEL } from '@/lib/repos/notification';
import { listCategoriesForSlider, listProductsForSlider } from '@/lib/repos/slider';
import { formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductImage from '@/components/admin/product-image';
import { SendNotificationButton, NotificationDeleteButton } from '@/components/admin/notifications-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'title', label: 'Title', defaultVisible: true },
  { key: 'type', label: 'Type', defaultVisible: true },
  { key: 'type_id', label: 'Type ID', defaultVisible: true },
  { key: 'product_or_category', label: 'Product / Category', defaultVisible: true },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'link', label: 'Link', defaultVisible: true },
  { key: 'message', label: 'Message', defaultVisible: true },
  { key: 'send_to', label: 'Send To', defaultVisible: true },
  { key: 'users_name', label: 'User(s) Name', defaultVisible: true },
  { key: 'date_sent', label: 'Date Sent', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

const TYPE_BADGE = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  category: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  product: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
};

export default async function NotificationsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
  };

  const [{ rows, total, totalPages, page }, categories, products] = await Promise.all([
    listNotifications(filters),
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Notification</h1>
          <p className="mt-1 text-sm text-slate-500">Push announcements and broadcasts to your users.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Manage Notifications</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            Notification Details
          </h2>
          <SendNotificationButton categories={categories} products={products} />
        </div>

        <div data-notifications-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-notifications-table" storageKey="admin.notifications.cols.v1" exportFilename="notifications" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="title" className="px-5 py-3">Title</th>
                  <th data-col="type" className="px-5 py-3 text-center">Type</th>
                  <th data-col="type_id" className="px-5 py-3 text-center">Type ID</th>
                  <th data-col="product_or_category" className="px-5 py-3">Product / Category</th>
                  <th data-col="image" className="px-5 py-3 text-center">Image</th>
                  <th data-col="link" className="px-5 py-3">Link</th>
                  <th data-col="message" className="px-5 py-3">Message</th>
                  <th data-col="send_to" className="px-5 py-3">Send To</th>
                  <th data-col="users_name" className="px-5 py-3">User(s) Name</th>
                  <th data-col="date_sent" className="px-5 py-3 whitespace-nowrap">Date Sent</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={12} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{n.id}</td>
                    <td data-col="title" className="px-5 py-3 font-medium text-slate-900 dark:text-white max-w-[14rem]"><div className="line-clamp-2" title={n.title}>{n.title}</div></td>
                    <td data-col="type" className="px-5 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[n.type] || ''}`}>
                        {NOTIFICATION_TYPE_LABEL[n.type] || n.type}
                      </span>
                    </td>
                    <td data-col="type_id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{n.type_id && n.type_id !== '0' ? n.type_id : '—'}</td>
                    <td data-col="product_or_category" className="px-5 py-3 text-slate-700 dark:text-slate-300">{n.product_or_category || '—'}</td>
                    <td data-col="image" className="px-5 py-3 text-center">
                      {n.image ? <div className="inline-block"><ProductImage src={n.image} alt={n.title} /></div> : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td data-col="link" className="px-5 py-3 text-slate-500 max-w-[12rem]"><div className="truncate" title={n.link}>{n.link || '—'}</div></td>
                    <td data-col="message" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[20rem]"><div className="line-clamp-2" title={n.message}>{n.message}</div></td>
                    <td data-col="send_to" className="px-5 py-3 text-slate-700 dark:text-slate-300">{SEND_TO_LABEL[n.send_to] || n.send_to || '—'}</td>
                    <td data-col="users_name" className="px-5 py-3 text-slate-500">—</td>
                    <td data-col="date_sent" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(n.date_sent)}</td>
                    <td data-col="actions" className="px-5 py-3 text-center"><NotificationDeleteButton row={n} /></td>
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