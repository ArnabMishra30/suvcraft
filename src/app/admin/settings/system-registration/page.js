import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import SystemRegistrationForm from '@/components/admin/system-registration-form';

export const dynamic = 'force-dynamic';

export default async function SystemRegistrationPage() {
  const initial = (await getSettings('purchase_codes').catch(() => null)) || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Purchase Code Validator</h1>
          <p className="mt-1 text-sm text-slate-500">Activate your installation with the purchase codes from your CodeCanyon receipts.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Purchase Code Validator</span>
        </nav>
      </div>

      <SystemRegistrationForm initial={initial} />
    </div>
  );
}