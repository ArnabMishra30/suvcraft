import { getDashboardStats, getRecentOrders } from '@/lib/repos/dashboard';
import { getSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

function formatCurrency(amount, code = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: code, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(0)}`;
  }
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

const STATUS_BADGE = {
  received: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  processed: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  returned: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default async function AdminDashboard() {
  const [stats, recent, sys] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
    getSettings('system_settings').catch(() => null),
  ]);
  const currency = sys?.currency || 'INR';

  const cards = [
    { label: 'Orders (30d)', value: stats.orders_30d.toLocaleString(), accent: 'from-blue-500 to-blue-600' },
    { label: 'Revenue (30d)', value: formatCurrency(stats.revenue_30d, currency), accent: 'from-emerald-500 to-emerald-600' },
    { label: 'Active Products', value: stats.products.toLocaleString(), accent: 'from-amber-500 to-amber-600' },
    { label: 'Customers', value: stats.customers.toLocaleString(), accent: 'from-indigo-500 to-indigo-600' },
    { label: 'Sellers', value: stats.sellers.toLocaleString(), accent: 'from-fuchsia-500 to-fuchsia-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Overview of activity in the last 30 days.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 overflow-hidden relative">
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.accent}`} />
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{c.label}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {recent.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No orders yet.</td></tr>
              )}
              {recent.map((o) => {
                const badge = STATUS_BADGE[String(o.status || '').toLowerCase()] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
                return (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">#{o.id}</td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{o.customer || '—'}</td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-300">{formatCurrency(Number(o.final_total || 0), currency)}</td>
                    <td className="px-5 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badge}`}>{o.status || '—'}</span></td>
                    <td className="px-5 py-3 text-slate-500 uppercase text-xs">{o.payment_method || '—'}</td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(o.date_added)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}