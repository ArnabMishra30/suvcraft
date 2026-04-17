import Link from 'next/link';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="px-4 sm:px-6 py-4 sm:py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <span className="inline-block w-8 h-8 rounded-lg bg-indigo-600" />
          eShop
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 pb-10">
        <div className="w-full max-w-md sm:max-w-lg">
          <div className="bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            {children}
          </div>
        </div>
      </main>

      <footer className="px-4 sm:px-6 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} eShop
      </footer>
    </div>
  );
}