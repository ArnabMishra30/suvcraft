import Link from 'next/link';
import { listSections } from '@/lib/repos/section';
import SectionsReorder from '@/components/admin/sections-reorder';

export const dynamic = 'force-dynamic';

export default async function SectionsOrderPage() {
  const { rows } = await listSections({ page: 1, perPage: 200 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Section Order</h1>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/featured-sections" className="hover:text-slate-700 dark:hover:text-slate-300">Featured Section</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Section Order</span>
        </nav>
      </div>

      <SectionsReorder sections={rows.map((r) => ({ id: r.id, title: r.title, row_order: r.row_order }))} />
    </div>
  );
}