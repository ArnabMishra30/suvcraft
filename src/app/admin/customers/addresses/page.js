import Link from 'next/link';
import { listCustomerAddresses } from '@/lib/repos/customer';
import TableToolbar from '@/components/admin/table-toolbar';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'username', label: 'User Name', defaultVisible: true },
  { key: 'type', label: 'Type', defaultVisible: true },
  { key: 'mobile', label: 'Mobile', defaultVisible: true },
  { key: 'alt_mobile', label: 'Alternate Mobile', defaultVisible: true },
  { key: 'address', label: 'Address', defaultVisible: true },
  { key: 'landmark', label: 'Landmark', defaultVisible: true },
  { key: 'area', label: 'Area', defaultVisible: true },
  { key: 'city', label: 'City', defaultVisible: true },
  { key: 'state', label: 'State', defaultVisible: true },
  { key: 'pincode', label: 'Pincode', defaultVisible: true },
  { key: 'country', label: 'Country', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function AddressesPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
  };

  const { rows, total, totalPages, page } = await listCustomerAddresses(filters);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">View Customer Address</h1>
          <p className="mt-1 text-sm text-slate-500">All saved addresses across customers.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/customers" className="hover:text-slate-700 dark:hover:text-slate-300">Customer</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Addresses</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Customer Address
          </h2>
        </div>

        <div data-addr-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-addr-table" storageKey="admin.addresses.cols.v1" exportFilename="customer-addresses" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="username" className="px-5 py-3">User Name</th>
                  <th data-col="type" className="px-5 py-3">Type</th>
                  <th data-col="mobile" className="px-5 py-3">Mobile</th>
                  <th data-col="alt_mobile" className="px-5 py-3">Alternate Mobile</th>
                  <th data-col="address" className="px-5 py-3">Address</th>
                  <th data-col="landmark" className="px-5 py-3">Landmark</th>
                  <th data-col="area" className="px-5 py-3">Area</th>
                  <th data-col="city" className="px-5 py-3">City</th>
                  <th data-col="state" className="px-5 py-3">State</th>
                  <th data-col="pincode" className="px-5 py-3">Pincode</th>
                  <th data-col="country" className="px-5 py-3">Country</th>
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
                {rows.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{a.id}</td>
                    <td data-col="username" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{a.username || '—'}</td>
                    <td data-col="type" className="px-5 py-3 text-xs uppercase text-slate-500">{a.type || '—'}</td>
                    <td data-col="mobile" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{a.mobile || '—'}</td>
                    <td data-col="alt_mobile" className="px-5 py-3 text-slate-500 whitespace-nowrap">{a.alternate_mobile || '—'}</td>
                    <td data-col="address" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[20rem] truncate" title={a.address || ''}>{a.address || '—'}</td>
                    <td data-col="landmark" className="px-5 py-3 text-slate-500 max-w-[12rem] truncate" title={a.landmark || ''}>{a.landmark || '—'}</td>
                    <td data-col="area" className="px-5 py-3 text-slate-500">{a.area || '—'}</td>
                    <td data-col="city" className="px-5 py-3 text-slate-700 dark:text-slate-300">{a.city || '—'}</td>
                    <td data-col="state" className="px-5 py-3 text-slate-500">{a.state || '—'}</td>
                    <td data-col="pincode" className="px-5 py-3 text-slate-500">{a.pincode || '—'}</td>
                    <td data-col="country" className="px-5 py-3 text-slate-500">{a.country || '—'}</td>
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