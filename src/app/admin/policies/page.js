import Link from 'next/link';
import { POLICIES } from '@/lib/policies';

export const dynamic = 'force-dynamic';

const ICONS = {
  'about-us': 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'privacy-policy': 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
  'shipping-policy': 'M9 17a2 2 0 11-4 0 2 2 0 014 0zm0 0h6m-6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 11-4 0 2 2 0 014 0zm0 0h2m-2 0a2 2 0 100-4 2 2 0 000 4zM5 9h14l1 7H4l1-7z',
  'return-policy': 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
  'admin-policies': 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4',
  'seller-policies': 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  'delivery-boy-policies': 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
};

export default function PoliciesHubPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Policies</h1>
          <p className="mt-1 text-sm text-slate-500">Edit the legal and informational pages shown across the storefront and apps.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Policies</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {POLICIES.map((p) => (
          <Link key={p.slug} href={`/admin/policies/${p.slug}`}
            className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-indigo-300 dark:hover:border-indigo-800 transition">
            <div className="pr-12">
              <div className="text-base font-semibold text-slate-900 dark:text-white">{p.title}</div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.description}</p>
            </div>
            <svg className="w-16 h-16 absolute -right-2 -top-2 text-sky-100 dark:text-sky-950/60 group-hover:text-indigo-200 dark:group-hover:text-indigo-900/60 transition"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[p.slug] || ICONS['about-us']} />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}