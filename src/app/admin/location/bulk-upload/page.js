import Link from 'next/link';
import LocationBulkForm from '@/components/admin/location-bulk-form';

export const dynamic = 'force-dynamic';

function DownloadBtn({ href, label, color = 'blue' }) {
  const palette = color === 'green'
    ? 'border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
    : 'border-blue-200/60 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300';
  return (
    <a href={href} className={`flex items-center justify-center gap-2 rounded-lg border ${palette} px-4 py-3 text-sm font-medium transition`}>
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4" /></svg>
      {label}
    </a>
  );
}

export default function LocationBulkUploadPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Bulk upload</h1>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/location/pickup-locations" className="hover:text-slate-700 dark:hover:text-slate-300">Location</Link>
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
              <li>For adding bulk locations file should be .csv format</li>
              <li>You can copy image path from media section</li>
              <li>Make sure you entered valid data as per instructions before proceed</li>
            </ul>
          </div>
        </div>
      </div>

      <LocationBulkForm />

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 mb-3">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Zipcode Files
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <DownloadBtn href="/api/admin/location/templates?kind=zipcode-upload" label="Zipcode Bulk upload template" />
          <DownloadBtn href="/api/admin/location/templates?kind=zipcode-update" label="Zipcode Bulk update template" />
          <DownloadBtn href="/api/admin/location/templates?kind=zipcode-export" label="Export all zipcodes" />
        </div>

        <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 mt-6 mb-3">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          City Files
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <DownloadBtn href="/api/admin/location/templates?kind=city-upload" label="City Bulk upload template" color="green" />
          <DownloadBtn href="/api/admin/location/templates?kind=city-update" label="Bulk update template" color="green" />
          <DownloadBtn href="/api/admin/location/templates?kind=city-export" label="City Export all cities" color="green" />
        </div>
      </div>
    </div>
  );
}