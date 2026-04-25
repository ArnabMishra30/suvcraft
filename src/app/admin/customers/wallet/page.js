import Link from 'next/link';
import { listCustomerWalletTransactions, listCustomersForFilter, listCustomersWithBalance } from '@/lib/repos/customer';
import { getSettings } from '@/lib/settings';
import { formatCurrency, formatDate } from '@/lib/format';
import TableToolbar from '@/components/admin/table-toolbar';
import WalletTabs from '@/components/admin/wallet-tabs';
import CustomerWalletFilters from '@/components/admin/customer-wallet-filters';

export const dynamic = 'force-dynamic';

const WALLET_COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'user', label: 'User Name', defaultVisible: true },
  { key: 'type', label: 'Type', defaultVisible: true },
  { key: 'amount', label: 'Amount(₹)', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'message', label: 'Message', defaultVisible: true },
  { key: 'date', label: 'Date', defaultVisible: true },
];
const WALLET_DEFAULT = WALLET_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

const USER_COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'email', label: 'Email', defaultVisible: true },
  { key: 'balance', label: 'Balance', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];
const USER_DEFAULT = USER_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

const STATUS = {
  0: { label: 'Awaiting', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  1: { label: 'Success', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  2: { label: 'Failed', cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
};

export default async function CustomerWalletPage({ searchParams }) {
  const sp = await searchParams;
  const tab = sp?.tab === 'users' ? 'users' : 'wallet';
  const sys = await getSettings('system_settings').catch(() => null);
  const currency = sys?.currency || 'INR';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Customer Wallet Transactions</h1>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/customers" className="hover:text-slate-700 dark:hover:text-slate-300">Customer</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Wallet</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <WalletTabs />

        {tab === 'users' ? <UsersTab sp={sp} currency={currency} /> : <WalletTab sp={sp} currency={currency} />}
      </div>
    </div>
  );
}

async function UsersTab({ sp, currency }) {
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
  };
  const { rows, total, totalPages, page } = await listCustomersWithBalance(filters);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div data-cust-wallet-users-table>
      <TableToolbar title="" columns={USER_COLUMNS} defaultVisible={USER_DEFAULT} tableAttr="data-cust-wallet-users-table" storageKey="admin.cust-wallet-users.cols.v1" exportFilename="customer-wallet-users" />
      <div className="overflow-x-auto rounded-b-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th data-col="id" className="px-5 py-3 text-center">ID</th>
              <th data-col="name" className="px-5 py-3">Name</th>
              <th data-col="email" className="px-5 py-3">Email</th>
              <th data-col="balance" className="px-5 py-3 text-right">Balance</th>
              <th data-col="actions" className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                <div className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                  No records available at the moment
                </div>
              </td></tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{u.id}</td>
                <td data-col="name" className="px-5 py-3 font-medium text-slate-900 dark:text-white">{u.name || '—'}</td>
                <td data-col="email" className="px-5 py-3 text-slate-700 dark:text-slate-300">{u.email || '—'}</td>
                <td data-col="balance" className="px-5 py-3 text-right text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{formatCurrency(u.balance, currency)}</td>
                <td data-col="actions" className="px-5 py-3 text-center">
                  <Link href={`?tab=wallet&userId=${u.id}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-medium">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    View Transactions
                  </Link>
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
  );
}

async function WalletTab({ sp, currency }) {
  const statusMap = { awaiting: 0, success: 1, failed: 2 };
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    userId: sp?.userId || '',
    status: sp?.status && statusMap[sp.status] !== undefined ? statusMap[sp.status] : '',
  };

  const [{ rows, total, totalPages, page }, customers] = await Promise.all([
    listCustomerWalletTransactions(filters),
    listCustomersForFilter(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <>
      <div className="p-5">
        <CustomerWalletFilters customers={customers} />
      </div>

      <div data-cust-wallet-table>
        <TableToolbar title="" columns={WALLET_COLUMNS} defaultVisible={WALLET_DEFAULT} tableAttr="data-cust-wallet-table" storageKey="admin.cust-wallet.cols.v1" exportFilename="customer-wallet-transactions" />

        <div className="overflow-x-auto rounded-b-xl">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th data-col="id" className="px-5 py-3 text-center">ID</th>
                <th data-col="user" className="px-5 py-3">User Name</th>
                <th data-col="type" className="px-5 py-3">Type</th>
                <th data-col="amount" className="px-5 py-3 text-right">Amount({currency})</th>
                <th data-col="status" className="px-5 py-3 text-center">Status</th>
                <th data-col="message" className="px-5 py-3">Message</th>
                <th data-col="date" className="px-5 py-3 whitespace-nowrap">Date</th>
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
              {rows.map((t) => {
                const isCredit = String(t.type).toLowerCase().includes('credit') || Number(t.amount) > 0;
                const st = STATUS[Number(t.status)] || { label: '—', cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
                return (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{t.id}</td>
                    <td data-col="user" className="px-5 py-3 text-slate-700 dark:text-slate-300">
                      <div className="font-medium text-slate-900 dark:text-white">{t.username || `User #${t.user_id}`}</div>
                      {t.email && <div className="text-xs text-slate-500">{t.email}</div>}
                    </td>
                    <td data-col="type" className="px-5 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${isCredit ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>{t.type || (isCredit ? 'credit' : 'debit')}</span></td>
                    <td data-col="amount" className={`px-5 py-3 text-right tabular-nums whitespace-nowrap font-medium ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{isCredit ? '+' : '-'} {formatCurrency(Math.abs(Number(t.amount || 0)), currency)}</td>
                    <td data-col="status" className="px-5 py-3 text-center"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                    <td data-col="message" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[24rem]"><div className="line-clamp-2" title={t.message || ''}>{t.message || '—'}</div></td>
                    <td data-col="date" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(t.date_created)}</td>
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
    </>
  );
}