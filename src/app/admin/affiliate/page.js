import Link from 'next/link';
import { getAffiliateStats } from '@/lib/repos/affiliate';
import { getSettings } from '@/lib/settings';
import { formatCurrency } from '@/lib/format';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, sub, icon, accent }) {
  const palette = {
    amber: 'text-amber-500/70',
    indigo: 'text-indigo-500/70',
    emerald: 'text-emerald-500/70',
  }[accent] || 'text-indigo-500/70';
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
      <svg className={`w-16 h-16 absolute -right-2 -top-2 ${palette}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </div>
  );
}

export default async function AffiliateDashboardPage() {
  const [stats, sys] = await Promise.all([
    getAffiliateStats().catch(() => ({ orders: 0, users: 0, earnings: 0 })),
    getSettings('system_settings').catch(() => null),
  ]);
  const currency = sys?.currency || 'INR';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Affiliate Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Overview of your affiliate program performance.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Affiliate</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Orders" value={stats.orders} sub="Total affiliate orders" accent="amber"
          icon="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        <StatCard label="Affiliate Users" value={stats.users} sub="Registered affiliates" accent="indigo"
          icon="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-5.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a4 4 0 11-8 0 4 4 0 018 0z" />
        <StatCard label="Admin Earnings" value={formatCurrency(stats.earnings, currency)} sub="Via affiliate program" accent="emerald"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Sales Summary</h2>
            <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
              {['Month', 'Week', 'Day'].map((p, i) => (
                <span key={p} className={`px-3 py-1 ${i === 0 ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-500'}`}>{p}</span>
              ))}
            </div>
          </div>
          <div className="p-12 text-center text-sm text-slate-500">
            <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            No sales data yet.
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Top Selling Categories</h2>
          </div>
          <div className="p-12 text-center text-sm text-slate-500">
            <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div className="font-medium text-slate-700 dark:text-slate-300">No Data Available</div>
            <div className="mt-1 text-xs">No category sales data found</div>
          </div>
        </div>
      </div>
    </div>
  );
}