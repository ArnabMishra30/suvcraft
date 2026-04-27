import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import AuthenticationSettingsForm from '@/components/admin/authentication-settings-form';

export const dynamic = 'force-dynamic';

export default async function AuthenticationSettingsPage() {
  const initial = (await getSettings('authentication_settings').catch(() => null)) || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Authentication Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Choose how users sign in to the storefront and apps.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">System Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Authentication Settings</span>
        </nav>
      </div>

      <AuthenticationSettingsForm initial={initial} />
    </div>
  );
}