'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import DateRangePicker from './date-range-picker';

const MEDIA_TYPES = [
  { value: '', label: 'All Media Items' },
  { value: 'image', label: 'Images' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
  { value: 'archive', label: 'Archive' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'document', label: 'Documents' },
];

export default function MediaFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [draft, setDraft] = useState({
    from: params.get('from') || '',
    to: params.get('to') || '',
    kind: params.get('kind') || '',
  });

  useEffect(() => {
    setDraft({
      from: params.get('from') || '',
      to: params.get('to') || '',
      kind: params.get('kind') || '',
    });
  }, [params]);

  function search() {
    const sp = new URLSearchParams(params);
    if (draft.from) sp.set('from', draft.from); else sp.delete('from');
    if (draft.to) sp.set('to', draft.to); else sp.delete('to');
    if (draft.kind) sp.set('kind', draft.kind); else sp.delete('kind');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function reset() {
    setDraft({ from: '', to: '', kind: '' });
    router.push(pathname);
  }

  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';
  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
      <div>
        <label className={labelCls}>Date and time range:</label>
        <DateRangePicker
          from={draft.from}
          to={draft.to}
          onChange={({ from, to }) => setDraft((d) => ({ ...d, from, to }))}
        />
      </div>
      <div>
        <label className={labelCls}>Media Type</label>
        <select value={draft.kind} onChange={(e) => setDraft((d) => ({ ...d, kind: e.target.value }))} className={inputCls}>
          {MEDIA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <button type="button" onClick={search}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-sm font-semibold text-white">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        Search
      </button>
      <button type="button" onClick={reset}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5m2 9a8 8 0 01-14 5" /></svg>
        Reset
      </button>
    </div>
  );
}