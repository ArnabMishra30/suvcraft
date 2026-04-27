import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { listCustomSms } from '@/lib/repos/custom-sms';
import { CUSTOM_NOTIFICATION_TYPE_LABEL } from '@/lib/notification-types';
import SmsGatewayTabs from '@/components/admin/sms-gateway-tabs';
import SmsGatewayConfigTab from '@/components/admin/sms-gateway-config-tab';
import NotificationMatrixTab from '@/components/admin/notification-matrix-tab';
import { CustomSmsAddForm, CustomSmsEditButton } from '@/components/admin/custom-sms-form';

export const dynamic = 'force-dynamic';

function TemplatesTab({ rows }) {
  return (
    <div className="space-y-6">
      <CustomSmsAddForm />

      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white text-center mb-3">Custom Message List</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-center w-16">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500 text-sm">No custom messages yet.</td></tr>
              )}
              {rows.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                  <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">{m.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-[16rem]"><div className="line-clamp-2" title={m.title}>{m.title}</div></td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">{CUSTOM_NOTIFICATION_TYPE_LABEL[m.type] || m.type}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[28rem]"><div className="line-clamp-2 text-xs" title={m.message}>{m.message}</div></td>
                  <td className="px-4 py-3 text-center"><CustomSmsEditButton row={m} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default async function SmsGatewayPage() {
  const [config, matrix, smsList] = await Promise.all([
    getSettings('sms_gateway_settings').catch(() => null),
    getSettings('send_notification_settings').catch(() => null),
    listCustomSms({ page: 1, perPage: 100 }).catch(() => ({ rows: [] })),
  ]);

  const tabs = [
    {
      id: 'configuration', label: 'Configuration',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
      content: <SmsGatewayConfigTab initial={config || {}} />,
    },
    {
      id: 'matrix', label: 'SMS Matrix',
      icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
      content: <NotificationMatrixTab initial={matrix || {}} />,
    },
    {
      id: 'templates', label: 'Templates',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      content: <TemplatesTab rows={smsList.rows || []} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Sms Gatway Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Configure your SMS provider, notification matrix, and custom templates.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Sms Gateway</span>
        </nav>
      </div>

      <SmsGatewayTabs tabs={tabs} />
    </div>
  );
}