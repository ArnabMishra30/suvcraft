import Link from 'next/link';
import { listMedia } from '@/lib/repos/media';
import TableToolbar from '@/components/admin/table-toolbar';
import MediaUploader from '@/components/admin/media-uploader';
import MediaFilters from '@/components/admin/media-filters';
import MediaTable from '@/components/admin/media-table';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  { key: 'select', label: 'Select', defaultVisible: true },
  { key: 'id', label: 'ID', defaultVisible: true },
  { key: 'seller_id', label: 'Seller ID', defaultVisible: true },
  { key: 'name', label: 'Name', defaultVisible: true },
  { key: 'image', label: 'Image', defaultVisible: true },
  { key: 'extension', label: 'Extension', defaultVisible: true },
  { key: 'sub_directory', label: 'Sub Directory', defaultVisible: true },
  { key: 'size', label: 'Size', defaultVisible: true },
  { key: 'actions', label: 'Actions', defaultVisible: true },
];

const DEFAULT_VISIBLE = COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);

export default async function MediaPage({ searchParams }) {
  const sp = await searchParams;
  const filters = {
    page: Number(sp?.page || 1),
    perPage: 20,
    search: sp?.q || '',
    kind: sp?.kind || '',
    from: sp?.from || '',
    to: sp?.to || '',
  };

  const { rows, total, totalPages, page } = await listMedia(filters);

  const baseQuery = new URLSearchParams();
  for (const [k, v] of Object.entries(sp || {})) {
    if (k !== 'page' && v) baseQuery.set(k, String(v));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Manage Media Gallery</h1>
          <p className="mt-1 text-sm text-slate-500">Upload and organise images, video, and other files.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Manage Media Gallery</span>
        </nav>
      </div>

      <MediaUploader />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Media Gallery
          </h2>
        </div>

        <div className="p-5">
          <MediaFilters />
        </div>

        <div data-media-table>
          <TableToolbar title="" columns={COLUMNS} defaultVisible={DEFAULT_VISIBLE} tableAttr="data-media-table" storageKey="admin.media.cols.v1" exportFilename="media-gallery" />

          <MediaTable rows={rows} />

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