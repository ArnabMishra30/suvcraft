import Link from 'next/link';
import { listPickupLocations } from '@/lib/repos/location';
import TableToolbar from '@/components/admin/table-toolbar';
import { VerifiedFilter, VerifyInfoButton, PickupRowActions } from '@/components/admin/pickup-locations-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'seller_id', label: 'Seller ID', defaultVisible: true },
  { key: 'seller_name', label: 'Seller Name', defaultVisible: true },
  { key: 'pickup_location', label: 'Pickup Locations', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'email', label: 'Email', defaultVisible: true },
  { key: 'phone', label: 'Phone', defaultVisible: true },
  { key: 'address', label: 'Address', defaultVisible: true },
  { key: 'address2', label: 'Address 2', defaultVisible: true },
  { key: 'city', label: 'City', defaultVisible: true },
  { key: 'pincode', label: 'Pincode', defaultVisible: true },
  { key: 'verified', label: 'Verified', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function PickupLocationsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    verified: sp?.verified || '',
  };

  const { rows, total, totalPages, page } = await listPickupLocations(filters);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Pickup Location</h1>
          <p className="mt-1 text-sm text-slate-500">Seller pickup addresses synced with Shiprocket.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Pickup Location</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l4-4h10l4 4M5 8h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" /></svg>
            Pickup Location Details
          </h2>
          <VerifyInfoButton />
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Filter By Verified Status</label>
            <VerifiedFilter />
          </div>
        </div>

        <div data-pickup-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-pickup-table" storageKey="admin.pickup.cols.v1" exportFilename="pickup-locations" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="seller_id" className="px-5 py-3 text-center">Seller ID</th>
                  <th data-col="seller_name" className="px-5 py-3">Seller Name</th>
                  <th data-col="pickup_location" className="px-5 py-3">Pickup Locations</th>
                  <th data-col="name" className="px-5 py-3">Name</th>
                  <th data-col="email" className="px-5 py-3">Email</th>
                  <th data-col="phone" className="px-5 py-3">Phone</th>
                  <th data-col="address" className="px-5 py-3">Address</th>
                  <th data-col="address2" className="px-5 py-3">Address 2</th>
                  <th data-col="city" className="px-5 py-3">City</th>
                  <th data-col="pincode" className="px-5 py-3">Pincode</th>
                  <th data-col="verified" className="px-5 py-3 text-center">Verified</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={13} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((r) => {
                  const verified = Number(r.status) === 1;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                      <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.id}</td>
                      <td data-col="seller_id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{r.seller_id || '—'}</td>
                      <td data-col="seller_name" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.seller_store || r.seller_username || '—'}</td>
                      <td data-col="pickup_location" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{r.pickup_location}</td>
                      <td data-col="name" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.name}</td>
                      <td data-col="email" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.email}</td>
                      <td data-col="phone" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.phone}</td>
                      <td data-col="address" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[18rem]"><div className="line-clamp-2" title={r.address}>{r.address}</div></td>
                      <td data-col="address2" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[14rem]"><div className="line-clamp-2" title={r.address_2}>{r.address_2 || '—'}</div></td>
                      <td data-col="city" className="px-5 py-3 text-slate-700 dark:text-slate-300">{r.city}</td>
                      <td data-col="pincode" className="px-5 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.pin_code}</td>
                      <td data-col="verified" className="px-5 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          verified
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </td>
                      <td data-col="actions" className="px-5 py-3 text-center"><PickupRowActions row={r} /></td>
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