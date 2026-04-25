import Link from 'next/link';
import CategoryBulkForm from '@/components/admin/category-bulk-form';

export const dynamic = 'force-dynamic';

export default function CategoryBulkUploadPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Category bulk upload</h1>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Bulk Upload</span>
        </nav>
      </div>

      <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <div className="font-semibold mb-1">Bulk Upload Instruction:</div>
            <ul className="list-disc pl-5 space-y-0.5 text-blue-800 dark:text-blue-300">
              <li>Read and follow instructions carefully while preparing data</li>
              <li>Download and save the sample file to reduce errors</li>
              <li>For adding bulk Category file should be .csv format</li>
              <li>You can copy image path from media section</li>
              <li>Make sure you entered valid data as per instructions before proceed</li>
            </ul>
          </div>
        </div>
      </div>

      <CategoryBulkForm />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 mb-3">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          Category Files
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <DownloadBtn href="/api/admin/categories/sample?kind=upload" label="Bulk upload template" />
          <DownloadBtn href="/api/admin/categories/sample?kind=update" label="Bulk update template" />
          <DownloadBtn href="/api/admin/categories/export" label="Bulk Download file" />
        </div>
      </div>
    </div>
  );
}

function DownloadBtn({ href, label }) {
  return (
    <a
      href={href}
      className="flex items-center justify-center gap-2 rounded-lg border border-blue-200/50 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-4 py-3 text-sm font-medium transition"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4" /></svg>
      {label}
    </a>
  );
}