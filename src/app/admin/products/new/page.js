import Link from 'next/link';
import {
  listBrandsForFilter,
  listTaxesForForm,
  listCountriesForForm,
  listPickupLocationsForForm,
  listAllCategoriesForForm,
} from '@/lib/repos/product';
import { listSellersForFilter } from '@/lib/repos/order';
import ProductForm from '@/components/admin/product-form';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const [sellers, brands, taxes, countries, pickupLocations, categories] = await Promise.all([
    listSellersForFilter(),
    listBrandsForFilter(),
    listTaxesForForm(),
    listCountriesForForm(),
    listPickupLocationsForForm(),
    listAllCategoriesForForm(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Add Product</h1>
          <p className="mt-1 text-sm text-slate-500">Create a new product in the catalog.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/products" className="hover:text-slate-700 dark:hover:text-slate-300">Products</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Add</span>
        </nav>
      </div>

      <ProductForm
        sellers={sellers}
        brands={brands}
        taxes={taxes}
        countries={countries}
        pickupLocations={pickupLocations}
        categories={categories}
      />
    </div>
  );
}