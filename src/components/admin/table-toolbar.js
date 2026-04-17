'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function TableToolbar({
  title = 'List',
  columns,
  defaultVisible,
  tableAttr = 'data-orders-table',
  storageKey = 'admin.table.cols.v1',
  exportFilename = 'export',
  searchPlaceholder = 'Search',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [colsOpen, setColsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [visible, setVisible] = useState(() => new Set(defaultVisible));
  const colsRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setVisible(new Set(parsed));
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    const all = document.querySelectorAll(`[${tableAttr}] [data-col]`);
    all.forEach((el) => {
      const key = el.getAttribute('data-col');
      el.style.display = visible.has(key) ? '' : 'none';
    });
    try { localStorage.setItem(storageKey, JSON.stringify([...visible])); } catch {}
  }, [visible, tableAttr, storageKey]);

  useEffect(() => {
    function onClick(e) {
      if (colsRef.current && !colsRef.current.contains(e.target)) setColsOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function toggleCol(key) {
    setVisible((v) => {
      const next = new Set(v);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function onSearch(e) {
    e.preventDefault();
    const sp = new URLSearchParams(params);
    if (q) sp.set('q', q); else sp.delete('q');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function refresh() { router.refresh(); }

  function exportData(kind) {
    setExportOpen(false);
    const table = document.querySelector(`[${tableAttr}] table`);
    if (!table) return;

    const visKeys = [...table.querySelectorAll('thead th[data-col]')]
      .filter((th) => th.style.display !== 'none')
      .map((th) => th.getAttribute('data-col'));
    const headers = visKeys.map((k) => columns.find((c) => c.key === k)?.label || k);

    const rows = [...table.querySelectorAll('tbody tr')].map((tr) => {
      return visKeys.map((k) => {
        const cell = tr.querySelector(`[data-col="${k}"]`);
        return (cell?.innerText || '').replace(/\s+/g, ' ').trim();
      });
    });

    if (kind === 'csv') downloadCsv(headers, rows, `${exportFilename}.csv`);
    else if (kind === 'excel') downloadCsv(headers, rows, `${exportFilename}.xls`);
    else downloadTxt(headers, rows, `${exportFilename}.txt`);
  }

  function downloadCsv(headers, rows, filename) {
    const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const csv = [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
    triggerDownload(csv, filename, 'text/csv;charset=utf-8');
  }

  function downloadTxt(headers, rows, filename) {
    const lines = [headers.join('\t'), ...rows.map((r) => r.join('\t'))];
    triggerDownload(lines.join('\n'), filename, 'text/plain;charset=utf-8');
  }

  function triggerDownload(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <form onSubmit={onSearch} className="relative">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full sm:w-56 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-3 pr-9 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button type="submit" aria-label="Search" className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>

        <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950">
          <button type="button" onClick={refresh} title="Refresh" className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l-lg">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5m2 9a8 8 0 01-14 5" /></svg>
          </button>

          <div ref={colsRef} className="relative border-l border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setExportOpen(false); setColsOpen((v) => !v); }}
              title="Columns"
              aria-expanded={colsOpen}
              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {colsOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-56 max-h-72 overflow-y-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1">
                {columns.map((c) => (
                  <label key={c.key} className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                    <input type="checkbox" checked={visible.has(c.key)} onChange={() => toggleCol(c.key)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div ref={exportRef} className="relative border-l border-slate-300 dark:border-slate-700">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setColsOpen(false); setExportOpen((v) => !v); }}
              title="Export"
              aria-expanded={exportOpen}
              className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1 rounded-r-lg"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-32 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1">
                <button type="button" onClick={() => exportData('csv')} className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">CSV</button>
                <button type="button" onClick={() => exportData('excel')} className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Excel</button>
                <button type="button" onClick={() => exportData('text')} className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Text</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}