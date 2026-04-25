import Link from 'next/link';
import { listCategoriesForOrdering } from '@/lib/repos/category';
import CategoryOrderList from '@/components/admin/category-order-list';

export const dynamic = 'force-dynamic';

export default async function CategoryOrderPage() {
  const rows = await listCategoriesForOrdering();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Categories Order</h1>
          <p className="mt-1 text-sm text-slate-500">Set the display order of categories in storefront listings.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/categories" className="hover:text-slate-700 dark:hover:text-slate-300">Categories</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Categories Order</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h13M3 12h13M3 18h13M19 6l2 2-2 2M19 14l2 2-2 2" /></svg>
            Category List
          </h2>
        </div>
        <div className="p-5">
          <CategoryOrderList initial={rows} />
        </div>
      </div>
    </div>
  );
}