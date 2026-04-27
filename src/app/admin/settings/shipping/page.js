import { headers } from 'next/headers';
import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import ShippingSettingsForm from '@/components/admin/shipping-settings-form';

export const dynamic = 'force-dynamic';

async function getBaseUrl() {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') || 'http';
  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

export default async function ShippingSettingsPage() {
  const [initial, baseUrl] = await Promise.all([
    getSettings('shipping_method').catch(() => ({})),
    getBaseUrl(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Shipping Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Local delivery and Shiprocket configuration for outbound orders.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">System Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Shipping Settings</span>
        </nav>
      </div>

      <ShippingSettingsForm initial={initial || {}} baseUrl={baseUrl} />
    </div>
  );
}