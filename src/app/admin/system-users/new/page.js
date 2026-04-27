import Link from 'next/link';
import SystemUserForm from '@/components/admin/system-user-form';

export const dynamic = 'force-dynamic';

export default function NewSystemUserPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Add System User</h1>
          <p className="mt-1 text-sm text-slate-500">Create a new admin staff account and assign module-level permissions.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/system-users" className="hover:text-slate-700 dark:hover:text-slate-300">System Users</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Add System User</span>
        </nav>
      </div>
      <SystemUserForm />
    </div>
  );
}