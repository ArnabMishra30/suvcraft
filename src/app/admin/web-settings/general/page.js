import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import WebGeneralForm from '@/components/admin/web-general-form';

export const dynamic = 'force-dynamic';

export default async function WebGeneralSettingsPage() {
  const [web, logo, footerLogo, favicon] = await Promise.all([
    getSettings('web_settings').catch(() => null),
    getSettings('web_logo', false).catch(() => null),
    getSettings('web_footer_logo', false).catch(() => null),
    getSettings('web_favicon', false).catch(() => null),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">General Website Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Public-facing site title, support contacts, branding, and feature toggles.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Web Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">General Website Settings</span>
        </nav>
      </div>

      <WebGeneralForm initial={web || {}} logo={logo || (web?.logo || '')} footerLogo={footerLogo || (web?.footer_logo || '')} favicon={favicon || (web?.favicon || '')} />
    </div>
  );
}