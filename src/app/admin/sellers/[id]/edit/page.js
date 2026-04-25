import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSeller, getSellerCategoryCommissions } from '@/lib/repos/seller';
import { listAllCategoriesForForm } from '@/lib/repos/product';
import SellerForm from '@/components/admin/seller-form';
import ClientOnly from '@/components/admin/client-only';

export const dynamic = 'force-dynamic';

export default async function EditSellerPage({ params }) {
  const { id } = await params;
  const [seller, categories, category_commissions] = await Promise.all([
    getSeller(id),
    listAllCategoriesForForm(),
    getSellerCategoryCommissions(id),
  ]);
  if (!seller) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Edit Seller</h1>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/sellers" className="hover:text-slate-700 dark:hover:text-slate-300">Seller</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Edit Seller</span>
        </nav>
      </div>
      <ClientOnly fallback={<div className="text-sm text-slate-500 py-8 text-center">Loading form…</div>}>
        <SellerForm initial={{ id, ...seller, category_commissions }} categories={categories} />
      </ClientOnly>
    </div>
  );
}