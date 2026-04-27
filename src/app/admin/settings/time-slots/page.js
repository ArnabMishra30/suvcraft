import Link from 'next/link';
import { listTimeSlots } from '@/lib/repos/time-slot';
import { getSettings } from '@/lib/settings';
import TableToolbar from '@/components/admin/table-toolbar';
import TimeSlotConfigForm from '@/components/admin/time-slot-config-form';
import { AddTimeSlotButton, TimeSlotRowActions } from '@/components/admin/time-slots-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'title', label: 'Title', defaultVisible: true },
  { key: 'from_time', label: 'From Time', defaultVisible: true },
  { key: 'to_time', label: 'To Time', defaultVisible: true },
  { key: 'last_order_time', label: 'Last Order Time', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'action', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

function fmtTime(t) {
  if (!t) return '—';
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

export default async function TimeSlotsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
  };

  const [{ rows, total, totalPages, page }, config] = await Promise.all([
    listTimeSlots(filters),
    getSettings('time_slot_config').catch(() => null),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Time Slots Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Define delivery windows your customers can pick at checkout.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">System Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Time Slots</span>
        </nav>
      </div>

      <TimeSlotConfigForm initial={config || {}} AddButton={<AddTimeSlotButton />} />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div data-time-slots-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-time-slots-table" storageKey="admin.time-slots.cols.v1" exportFilename="time-slots" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="title" className="px-5 py-3">Title</th>
                  <th data-col="from_time" className="px-5 py-3 text-center">From Time</th>
                  <th data-col="to_time" className="px-5 py-3 text-center">To Time</th>
                  <th data-col="last_order_time" className="px-5 py-3 text-center">Last Order Time</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="action" className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((s) => {
                  const active = Number(s.status) === 1;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{s.id}</td>
                      <td data-col="title" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{s.title}</td>
                      <td data-col="from_time" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300 tabular-nums">{fmtTime(s.from_time)}</td>
                      <td data-col="to_time" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300 tabular-nums">{fmtTime(s.to_time)}</td>
                      <td data-col="last_order_time" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300 tabular-nums">{fmtTime(s.last_order_time)}</td>
                      <td data-col="status" className="px-5 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                          active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {active ? 'Active' : 'Deactive'}
                        </span>
                      </td>
                      <td data-col="action" className="px-5 py-3 text-center"><TimeSlotRowActions row={s} /></td>
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