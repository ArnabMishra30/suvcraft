import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import NotificationSettingsForm from '@/components/admin/notification-settings-form';

export const dynamic = 'force-dynamic';

export default async function NotificationSettingsPage() {
  const [vapId, projectId, serviceFile] = await Promise.all([
    getSettings('vap_id_Key', false).catch(() => ''),
    getSettings('firebase_project_id', false).catch(() => ''),
    getSettings('firebase_service_account_file', false).catch(() => ''),
  ]);

  const initial = {
    vap_id_Key: vapId || '',
    firebase_project_id: projectId || '',
    firebase_service_account_file: serviceFile || '',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Notification Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Firebase Cloud Messaging credentials for push notifications.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">System Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Notification Settings</span>
        </nav>
      </div>

      <NotificationSettingsForm initial={initial} />
    </div>
  );
}