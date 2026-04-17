import Link from 'next/link';
import BulkUploadForm from '@/components/admin/bulk-upload-form';

export const dynamic = 'force-dynamic';

export default function BulkUploadPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Bulk upload</h1>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/products" className="hover:text-slate-700 dark:hover:text-slate-300">Product</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Product Bulk Upload</span>
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
              <li>For adding bulk Product file should be .csv format</li>
              <li>You can copy image path from media section</li>
              <li>Make sure you entered valid data as per instructions before proceed</li>
            </ul>
          </div>
        </div>
      </div>

      <BulkUploadForm />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DownloadCard
          title="Bulk Upload"
          tone="blue"
          icon="up"
          links={[
            { label: 'Bulk upload sample file', href: '/uploads/product-bulk-upload-sample.csv', download: 'product-bulk-upload-sample.csv' },
            { label: 'Bulk upload instructions', href: '/uploads/bulk-upload-instructions.txt', download: 'bulk-upload-instructions.txt' },
          ]}
        />
        <DownloadCard
          title="Bulk Update"
          tone="emerald"
          icon="up"
          links={[
            { label: 'Bulk update sample file', href: '/uploads/product-bulk-update-sample.csv', download: 'product-bulk-update-sample.csv' },
            { label: 'Bulk update instructions', href: '/uploads/bulk-update-instructions.txt', download: 'bulk-update-instructions.txt' },
          ]}
        />
      </div>
    </div>
  );
}

function DownloadCard({ title, tone, links }) {
  const toneCls = tone === 'emerald'
    ? { title: 'text-emerald-600 dark:text-emerald-400', card: 'border-emerald-200/50 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' }
    : { title: 'text-blue-600 dark:text-blue-400', card: 'border-blue-200/50 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300' };

  return (
    <div>
      <h3 className={`text-sm font-semibold mb-2 inline-flex items-center gap-1 ${toneCls.title}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" /></svg>
        {title}
      </h3>
      <div className="space-y-2">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            download={l.download}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition ${toneCls.card}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4" /></svg>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}