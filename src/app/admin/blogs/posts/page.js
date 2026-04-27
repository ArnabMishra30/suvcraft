import Link from 'next/link';
import { listBlogs, listBlogCategoriesForFilter } from '@/lib/repos/blog';
import TableToolbar from '@/components/admin/table-toolbar';
import ProductImage from '@/components/admin/product-image';
import BlogFilters from '@/components/admin/blog-filters';
import { AddBlogButton, BlogRowActions, BlogStatusToggle } from '@/components/admin/blogs-client';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'category', label: 'Category', defaultVisible: true },
  { key: 'title', label: 'Title', defaultVisible: true },
  { key: 'description', label: 'Description', defaultVisible: true },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'status', label: 'Status', defaultVisible: true },
  { key: 'action', label: 'Action', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

function stripHtml(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default async function ManageBlogsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    categoryId: sp?.categoryId || '',
  };

  const [{ rows, total, totalPages, page }, categories] = await Promise.all([
    listBlogs(filters),
    listBlogCategoriesForFilter(),
  ]);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage blogs</h1>
          <p className="mt-1 text-sm text-slate-500">Write and publish blog posts.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Blogs</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
            Blogs
          </h2>
          <AddBlogButton categories={categories} />
        </div>

        <div className="p-5">
          <BlogFilters categories={categories} />
        </div>

        <div data-blogs-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-blogs-table" storageKey="admin.blogs.cols.v1" exportFilename="blogs" />

          <div className="overflow-x-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th data-col="id" className="px-5 py-3 text-center">ID</th>
                  <th data-col="category" className="px-5 py-3">Category</th>
                  <th data-col="title" className="px-5 py-3">Title</th>
                  <th data-col="description" className="px-5 py-3">Description</th>
                  <th data-col="image" className="px-5 py-3 text-center">Image</th>
                  <th data-col="status" className="px-5 py-3 text-center">Status</th>
                  <th data-col="action" className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rows.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.84-2.75L13.74 4a2 2 0 00-3.48 0l-7.1 12.25A2 2 0 005 19z" /></svg>
                      No records available at the moment
                    </div>
                  </td></tr>
                )}
                {rows.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50">
                    <td data-col="id" className="px-5 py-3 text-center text-slate-700 dark:text-slate-300">{b.id}</td>
                    <td data-col="category" className="px-5 py-3 text-slate-700 dark:text-slate-300">{b.category_name || '—'}</td>
                    <td data-col="title" className="px-5 py-3 font-medium text-slate-900 dark:text-white max-w-[18rem]">
                      <div className="line-clamp-2" title={b.title}>{b.title}</div>
                    </td>
                    <td data-col="description" className="px-5 py-3 text-slate-700 dark:text-slate-300 max-w-[24rem]">
                      <div className="line-clamp-2" title={stripHtml(b.description)}>{stripHtml(b.description)}</div>
                    </td>
                    <td data-col="image" className="px-5 py-3 text-center">
                      {b.image ? <div className="inline-block"><ProductImage src={b.image} alt={b.title} /></div> : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td data-col="status" className="px-5 py-3 text-center"><BlogStatusToggle row={b} /></td>
                    <td data-col="action" className="px-5 py-3 text-center"><BlogRowActions row={b} categories={categories} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            <div>Showing {rows.length === 0 ? 0 : ((page - 1) * 20 + 1)} to {(page - 1) * 20 + rows.length} of {total} rows</div>
            {totalPages > 1 && (
              <div className="flex gap-2">
                {page > 1 && <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page - 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700">Previous</Link>}
                {page < totalPages && <Link href={`?${new URLSearchParams({ ...Object.fromEntries(baseQuery), page: String(page + 1) }).toString()}`} className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700">Next</Link>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}