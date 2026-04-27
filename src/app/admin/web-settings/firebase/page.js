import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import FirebaseSettingsForm from '@/components/admin/firebase-settings-form';

export const dynamic = 'force-dynamic';

export default async function FirebaseSettingsPage() {
  const initial = (await getSettings('firebase_settings').catch(() => null)) || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Firebase Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Web Firebase configuration used by the storefront and admin push notifications.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Web Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Firebase Settings</span>
        </nav>
      </div>

      <FirebaseSettingsForm initial={initial} />
    </div>
  );
}