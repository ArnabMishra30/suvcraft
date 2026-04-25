import Link from 'next/link';
import { listProductFaqs, listProductsForFilter } from '@/lib/repos/product-faq';
import TableToolbar from '@/components/admin/table-toolbar';
import { AddProductFaqButton, ProductFaqFilter, ProductFaqRowActions } from '@/components/admin/product-faqs-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'user_id', label: 'User Id', defaultVisible: false },
  { key: 'product_id', label: 'Product Id', defaultVisible: false },
  { key: 'product', label: 'Product Name', defaultVisible: true },
  { key: 'question', label: 'Question', defaultVisible: true },
  { key: 'answer', label: 'Answer', defaultVisible: true },
  { key: 'answered_by', label: 'Answered By', defaultVisible: true },
  { key: 'username', label: 'Username', defaultVisible: true },
  { key: 'date_added', label: 'Date added', defaultVisible: false },
  { key: 'actions', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function ProductFaqsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    productId: sp?.productId || '',
  };

  const [{ rows, total, totalPages, page }, products] = await Promise.all([
    listProductFaqs(filters),
    listProductsForFilter(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Products FAQs</h1>
          <p className="mt-1 text-sm text-slate-500">Answer customer questions about products.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/products" className="hover:text-slate-700 dark:hover:text-slate-300">Products</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Product FAQs</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            FAQ
          </h2>
          <AddProductFaqButton products={products} />
        </div>

        <div className="p-5">
          <ProductFaqFilter products={products} />
        </div>

        <div data-faqs-table>
          <TableToolbar
            title=""
            columns={COLUMNS}
            defaultVisible={DEFAULT_VISIBLE}
            tableAttr="data-faqs-table"
            storageKey="admin.faqs.cols.v1"
            exportFilename="product-faqs"
          />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="user_id" className="px-5 py-3 text-center">User Id</th>
                  <th data-col="product_id" className="px-5 py-3 text-center">Product Id</th>
                  <th data-col="product" className="px-5 py-3">Product Name</th>
                  <th data-col="question" className="px-5 py-3">Question</th>
                  <th data-col="answer" className="px-5 py-3">Answer</th>
                  <th data-col="answered_by" className="px-5 py-3">Answered By</th>
                  <th data-col="username" className="px-5 py-3">Username</th>
                  <th data-col="date_added" className="px-5 py-3 whitespace-nowrap">Date added</th>
                  <th data-col="actions" className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={10} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{f.id}</td>
                    <td data-col="user_id" className="px-5 py-3 text-center text-slate-500">{f.user_id || '—'}</td>
                    <td data-col="product_id" className="px-5 py-3 text-center text-slate-500">{f.product_id || '—'}</td>
                    <td data-col="product" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[16rem] truncate" title={f.product_name || ''}>{f.product_name || <span className="text-slate-500 italic">(orphan)</span>}</td>
                    <td data-col="question" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[20rem]">
                      <div className="line-clamp-2" title={f.question}>{f.question}</div>
                    </td>
                    <td data-col="answer" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[20rem]">
                      {f.answer
                        ? <div className="line-clamp-2" title={f.answer}>{f.answer}</div>
                        : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">Unanswered</span>}
                    </td>
                    <td data-col="answered_by" className="px-5 py-3 text-slate-500 text-xs">{f.answered_by_username || '—'}</td>
                    <td data-col="username" className="px-5 py-3 text-slate-500 text-xs">{f.asked_by_username || '—'}</td>
                    <td data-col="date_added" className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{f.date_added ? new Date(f.date_added).toLocaleString() : '—'}</td>
                    <td data-col="actions" className="px-5 py-3 text-center">
                      <ProductFaqRowActions row={f} products={products} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm">
              <div className="text-slate-500">Page {page} of {totalPages} · {total.toLocaleString()} total</div>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page - 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Previous</Link>
                )}
                {page < totalPages && (
                  <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page + 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Next</Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}