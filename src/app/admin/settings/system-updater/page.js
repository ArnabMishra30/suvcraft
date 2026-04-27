import Link from 'next/link';
import SystemUpdaterForm from '@/components/admin/system-updater-form';

export const dynamic = 'force-dynamic';

const VERSION = process.env.npm_package_version || '3.2.1';

export default function SystemUpdaterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Update (Version {VERSION})</h1>
          <p className="mt-1 text-sm text-slate-500">Apply a packaged update — drop a .zip below.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">System Update</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Update System</h2>
        </div>
        <div className="p-5 space-y-4">
          <SystemUpdaterForm />
        </div>
      </div>
    </div>
  );
}