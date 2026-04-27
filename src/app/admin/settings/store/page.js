import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { listSellersForFilter } from '@/lib/repos/order';
import StoreSettingsForm from '@/components/admin/store-settings-form';

export const dynamic = 'force-dynamic';

const CURRENCY_CODES = [
  'AED', 'AUD', 'BDT', 'BRL', 'CAD', 'CHF', 'CNY', 'EGP', 'EUR', 'GBP', 'HKD',
  'IDR', 'INR', 'JPY', 'KRW', 'KWD', 'MXN', 'MYR', 'NGN', 'NOK', 'NZD', 'PHP',
  'PKR', 'PLN', 'QAR', 'RUB', 'SAR', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'VND', 'ZAR',
];

export default async function StoreSettingsPage() {
  const [system, logo, favicon, currency, sellers] = await Promise.all([
    getSettings('system_settings').catch(() => null),
    getSettings('logo', false).catch(() => null),
    getSettings('favicon', false).catch(() => null),
    getSettings('currency', false).catch(() => null),
    listSellersForFilter().catch(() => []),
  ]);

  const initial = {
    system_settings: system || {},
    logo: logo || '',
    favicon: favicon || '',
    currency: currency || '₹',
    sellers,
    currencyOptions: CURRENCY_CODES.map((c) => ({ value: c, label: `${c} - ${c}` })),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Store Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Branding, regional defaults, cart rules, and operational toggles.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="hover:text-slate-700 dark:hover:text-slate-300">Settings</span>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Store Settings</span>
        </nav>
      </div>

      <StoreSettingsForm initial={initial} />
    </div>
  );
}