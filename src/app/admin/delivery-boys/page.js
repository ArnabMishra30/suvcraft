import Link from 'next/link';
import { listDeliveryBoys, listCitiesForFilter, DB_STATUS } from '@/lib/repos/delivery-boy';
import { getSettings } from '@/lib/settings';
import { formatCurrency } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import { DeliveryBoyStatusFilter, AddDeliveryBoyButton, DeliveryBoyRowActions } from '@/components/admin/delivery-boys-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'email', label: 'Email', defaultVisible: true },
  { key: 'mobile', label: 'Mobile No', defaultVisible: true },
  { key: 'address', label: 'Address', defaultVisible: true },
  { key: 'bonus_type', label: 'Bonus Type', defaultVisible: true },
  { key: 'bonus', label: 'Bonus(₹)', defaultVisible: true },
  { key: 'cash_received', label: 'Cash Received(₹)', defaultVisible: true },
  { key: 'balance', label: 'Balance(₹)', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'date', label: 'Date', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

const BONUS_TYPE_LABEL = {
  percentage_per_order: 'Percentage / Order',
  fixed_per_order: 'Fixed / Order',
};

export default async function DeliveryBoysPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    status: sp?.status ?? '',
  };

  const [{ rows, total, totalPages, page }, cities, sys] = await Promise.all([
    listDeliveryBoys(filters),
    listCitiesForFilter(),
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Delivery Boy</h1>
          <p className="mt-1 text-sm text-slate-500">Onboard and manage delivery personnel.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Manage Delivery Boy</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l4-4 4 4M7 4v12m0 0l4 4 4-4m6-12v12" /></svg>
            Manage Delivery Boy
          </h2>
          <AddDeliveryBoyButton cities={cities} />
        </div>

        <div className="p-5">
          <DeliveryBoyStatusFilter />
        </div>

        <div data-db-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-db-table" storageKey="admin.deliveryboys.cols.v1" exportFilename="delivery-boys" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="email" className="px-5 py-3">Email</th>
                  <th data-col="mobile" className="px-5 py-3">Mobile No</th>
                  <th data-col="address" className="px-5 py-3">Address</th>
                  <th data-col="bonus_type" className="px-5 py-3">Bonus Type</th>
                  <th data-col="bonus" className="px-5 py-3 text-right">Bonus({currency})</th>
                  <th data-col="cash_received" className="px-5 py-3 text-right">Cash Received({currency})</th>
                  <th data-col="balance" className="px-5 py-3 text-right">Balance({currency})</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="date" className="px-5 py-3 whitespace-nowrap">Date</th>
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
                {rows.map((d) => {
                  const st = DB_STATUS[Number(d.status)] || { label: '—', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{d.id}</td>
                      <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{d.name || '—'}</td>
                      <td data-col="email" className="px-5 py-3 text-slate-700 dark:text-slate-300">{d.email || '—'}</td>
                      <td data-col="mobile" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{d.mobile || '—'}</td>
                      <td data-col="address" className="px-5 py-3 text-slate-500 max-w-[16rem] truncate" title={d.address || ''}>{d.address || '—'}</td>
                      <td data-col="bonus_type" className="px-5 py-3 text-slate-700 dark:text-slate-300 text-xs">{BONUS_TYPE_LABEL[d.bonus_type] || d.bonus_type || '—'}</td>
                      <td data-col="bonus" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">{d.bonus_type === 'percentage_per_order' ? `${d.bonus || 0}%` : formatCurrency(d.bonus, currency)}</td>
                      <td data-col="cash_received" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(d.cash_received, currency)}</td>
                      <td data-col="balance" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums">{formatCurrency(d.balance, currency)}</td>
                      <td data-col="status" className="px-5 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                      <td data-col="date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{d.created_on ? new Date(d.created_on * 1000).toLocaleDateString() : '—'}</td>
                      <td data-col="actions" className="px-5 py-3 text-center"><DeliveryBoyRowActions row={d} cities={cities} /></td>
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