import Link from 'next/link';
import { listPromoCodes, PROMO_DISCOUNT_TYPE } from '@/lib/repos/promo-code';
import { getSettings } from '@/lib/settings';
import { formatCurrency, formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductImage from '@/components/admin/product-image';
import { PromoCodeFilters, AddPromoCodeButton, PromoCodeStatusToggle, PromoCodeRowActions } from '@/components/admin/promo-codes-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'promo_code', label: 'Promo Code', defaultVisible: true },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'message', label: 'Message', defaultVisible: true },
  { key: 'start_date', label: 'Start Date', defaultVisible: true },
  { key: 'end_date', label: 'End Date', defaultVisible: true },
  { key: 'no_of_users', label: 'No. of Users', defaultVisible: true },
  { key: 'min_amount', label: 'Min. Order Amount', defaultVisible: true },
  { key: 'discount', label: 'Discount', defaultVisible: true },
  { key: 'discount_type', label: 'Discount Type', defaultVisible: true },
  { key: 'max_discount', label: 'Max Discount', defaultVisible: true },
  { key: 'repeat_usage', label: 'Repeat Usage', defaultVisible: true },
  { key: 'no_of_repeat', label: 'No of Repeat Usage', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'is_cashback', label: 'Is Cashback', defaultVisible: true },
  { key: 'list_promocode', label: 'View Promocode', defaultVisible: true },
  { key: 'cashback_value', label: 'Cash Back Value', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

function YesNoPill({ active }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
      active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    }`}>{active ? 'Yes' : 'No'}</span>
  );
}

export default async function PromoCodesPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    discountType: sp?.discountType || '',
    status: sp?.status || '',
  };

  const [{ rows, total, totalPages, page }, sys] = await Promise.all([
    listPromoCodes(filters),
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Promo Code</h1>
          <p className="mt-1 text-sm text-slate-500">Promotional codes redeemable at checkout.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Manage Promo Code</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Filters &amp; Search
          </h2>
        </div>
        <div className="p-5"><PromoCodeFilters /></div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" /></svg>
            Manage Promo Codes
          </h2>
          <AddPromoCodeButton />
        </div>

        <div data-promo-codes-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-promo-codes-table" storageKey="admin.promo-codes.cols.v1" exportFilename="promo-codes" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="promo_code" className="px-5 py-3">Promo Code</th>
                  <th data-col="image" className="px-5 py-3 text-center">Image</th>
                  <th data-col="message" className="px-5 py-3">Message</th>
                  <th data-col="start_date" className="px-5 py-3 whitespace-nowrap">Start Date</th>
                  <th data-col="end_date" className="px-5 py-3 whitespace-nowrap">End Date</th>
                  <th data-col="no_of_users" className="px-5 py-3 text-center">No. of Users</th>
                  <th data-col="min_amount" className="px-5 py-3 text-right">Min. Order Amount</th>
                  <th data-col="discount" className="px-5 py-3 text-right">Discount</th>
                  <th data-col="discount_type" className="px-5 py-3 text-center">Discount Type</th>
                  <th data-col="max_discount" className="px-5 py-3 text-right">Max Discount</th>
                  <th data-col="repeat_usage" className="px-5 py-3 text-center">Repeat Usage</th>
                  <th data-col="no_of_repeat" className="px-5 py-3 text-center">No of Repeat Usage</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="is_cashback" className="px-5 py-3 text-center">Is Cashback</th>
                  <th data-col="list_promocode" className="px-5 py-3 text-center">View Promocode</th>
                  <th data-col="cashback_value" className="px-5 py-3 text-right">Cash Back Value</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={18} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((p) => {
                  const dt = PROMO_DISCOUNT_TYPE[p.discount_type] || { label: p.discount_type || '—', cls: 'bg-slate-100 text-slate-700' };
                  const isPercent = p.discount_type === 'percentage';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{p.id}</td>
                      <td data-col="promo_code" className="px-5 py-3 font-mono font-semibold text-slate-900 dark:text-white">{p.promo_code}</td>
                      <td data-col="image" className="px-5 py-3 text-center">
                        {p.image ? <div className="inline-block"><ProductImage src={p.image} alt={p.promo_code} /></div> : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td data-col="message" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[20rem]"><div className="line-clamp-2" title={p.message}>{p.message || '—'}</div></td>
                      <td data-col="start_date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(p.start_date)}</td>
                      <td data-col="end_date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(p.end_date)}</td>
                      <td data-col="no_of_users" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300 tabular-nums">{p.no_of_users ?? 0}</td>
                      <td data-col="min_amount" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatCurrency(p.minimum_order_amount, currency)}</td>
                      <td data-col="discount" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                        {isPercent ? `${Number(p.discount)}%` : formatCurrency(p.discount, currency)}
                      </td>
                      <td data-col="discount_type" className="px-5 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${dt.cls}`}>{dt.label}</span></td>
                      <td data-col="max_discount" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{p.max_discount_amount ? formatCurrency(p.max_discount_amount, currency) : '—'}</td>
                      <td data-col="repeat_usage" className="px-5 py-3 text-center"><YesNoPill active={Number(p.repeat_usage) === 1} /></td>
                      <td data-col="no_of_repeat" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300 tabular-nums">{p.no_of_repeat_usage ?? 0}</td>
                      <td data-col="status" className="px-5 py-3 text-center"><PromoCodeStatusToggle row={p} /></td>
                      <td data-col="is_cashback" className="px-5 py-3 text-center"><YesNoPill active={Number(p.is_cashback) === 1} /></td>
                      <td data-col="list_promocode" className="px-5 py-3 text-center"><YesNoPill active={Number(p.list_promocode) === 1} /></td>
                      <td data-col="cashback_value" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{Number(p.is_cashback) === 1 && Number(p.discount) ? (isPercent ? `${Number(p.discount)}%` : formatCurrency(p.discount, currency)) : '—'}</td>
                      <td data-col="actions" className="px-5 py-3 text-center"><PromoCodeRowActions row={p} /></td>
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