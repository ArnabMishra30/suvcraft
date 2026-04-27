import Link from 'next/link';
import { listTickets, TICKET_STATUS } from '@/lib/repos/ticket';
import { listAllTicketTypes } from '@/lib/repos/ticket-type';
import { formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import TicketFilters from '@/components/admin/ticket-filters';
import { TicketRowActions } from '@/components/admin/tickets-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'ticket_type_id', label: 'Ticket Type ID', defaultVisible: true },
  { key: 'ticket_type', label: 'Ticket Type', defaultVisible: true },
  { key: 'user_id', label: 'User ID', defaultVisible: true },
  { key: 'user_name', label: 'User Name', defaultVisible: true },
  { key: 'subject', label: 'Subject', defaultVisible: true },
  { key: 'email', label: 'Email', defaultVisible: true },
  { key: 'description', label: 'Description', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'last_updated', label: 'Last Updated', defaultVisible: true },
  { key: 'date_created', label: 'Date Created', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function TicketSystemPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    typeId: sp?.typeId || '',
    status: sp?.status || '',
  };

  const [{ rows, total, totalPages, page }, types] = await Promise.all([
    listTickets(filters),
    listAllTicketTypes(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Ticket System</h1>
          <p className="mt-1 text-sm text-slate-500">Support tickets raised by customers, sellers, delivery boys, and affiliates.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/support/tickets" className="hover:text-slate-700 dark:hover:text-slate-300">Support &amp; Communication</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Ticket System</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            Ticket System
          </h2>
        </div>

        <div className="p-5">
          <TicketFilters types={types} />
        </div>

        <div data-tickets-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-tickets-table" storageKey="admin.tickets.cols.v1" exportFilename="tickets" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="ticket_type_id" className="px-5 py-3 text-center">Ticket Type ID</th>
                  <th data-col="ticket_type" className="px-5 py-3">Ticket Type</th>
                  <th data-col="user_id" className="px-5 py-3 text-center">User ID</th>
                  <th data-col="user_name" className="px-5 py-3">User Name</th>
                  <th data-col="subject" className="px-5 py-3">Subject</th>
                  <th data-col="email" className="px-5 py-3">Email</th>
                  <th data-col="description" className="px-5 py-3">Description</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="last_updated" className="px-5 py-3 whitespace-nowrap">Last Updated</th>
                  <th data-col="date_created" className="px-5 py-3 whitespace-nowrap">Date Created</th>
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
                {rows.map((t) => {
                  const st = TICKET_STATUS[Number(t.status)] || { label: '—', cls: 'bg-slate-100 text-slate-700' };
                  return (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{t.id}</td>
                      <td data-col="ticket_type_id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{t.ticket_type_id || '—'}</td>
                      <td data-col="ticket_type" className="px-5 py-3 text-slate-700 dark:text-slate-300">{t.ticket_type_title || '—'}</td>
                      <td data-col="user_id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{t.user_id || '—'}</td>
                      <td data-col="user_name" className="px-5 py-3 text-slate-700 dark:text-slate-300">{t.user_name || '—'}</td>
                      <td data-col="subject" className="px-5 py-3 font-medium text-slate-900 dark:text-white max-w-[18rem]"><div className="line-clamp-2" title={t.subject}>{t.subject}</div></td>
                      <td data-col="email" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{t.email}</td>
                      <td data-col="description" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[24rem]"><div className="line-clamp-2" title={t.description}>{t.description}</div></td>
                      <td data-col="status" className="px-5 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                      <td data-col="last_updated" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(t.last_updated)}</td>
                      <td data-col="date_created" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(t.date_created)}</td>
                      <td data-col="actions" className="px-5 py-3 text-center"><TicketRowActions row={t} /></td>
                    </tr>
                  );
                })}
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