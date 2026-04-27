import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { listCategoriesForFilter } from '@/lib/repos/product';
import AffiliateSettingsForm from '@/components/admin/affiliate-settings-form';

export const dynamic = 'force-dynamic';

export default async function AffiliateSettingsPage() {
  const [initial, categories] = await Promise.all([
    getSettings('affiliate_settings').catch(() => null),
    listCategoriesForFilter().catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Affiliate Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Commission rules, signup flow, and payout thresholds.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/affiliate" className="hover:text-slate-700 dark:hover:text-slate-300">Affiliate</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Settings</span>
        </nav>
      </div>

      <AffiliateSettingsForm initial={initial || {}} categories={categories} />
    </div>
  );
}