import Link from 'next/link';
import { listSellersForFilterShort } from '@/lib/repos/wallet-transaction';
import { getSettings } from '@/lib/settings';
import WalletPageClient from '@/components/admin/wallet-page-client';

export const dynamic = 'force-dynamic';

export default async function SellerWalletTransactionsPage() {
  const [sellers, sys] = await Promise.all([
    listSellersForFilterShort(),
    getSettings('system_settings').catch(() => null),
  ]);
  const currency = sys?.currency || 'INR';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Seller Wallet Transactions</h1>
          <p className="mt-1 text-sm text-slate-500">Credit, debit and payout activity for seller wallets.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/sellers" className="hover:text-slate-700 dark:hover:text-slate-300">Sellers</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Seller Wallet</span>
        </nav>
      </div>

      <WalletPageClient sellers={sellers} currency={currency} />
    </div>
  );
}