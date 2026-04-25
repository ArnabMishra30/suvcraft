'use client';

import { useEffect, useRef, useState } from 'react';

export default function SearchableSelect({ value, onChange, options = [], placeholder = 'Search…', getLabel = (o) => o.name, getValue = (o) => o.id }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const selected = options.find((o) => String(getValue(o)) === String(value));
  const filtered = query
    ? options.filter((o) => String(getLabel(o)).toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="block w-full text-left rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-8">
        <span className={selected ? 'text-slate-900 dark:text-slate-100 truncate block' : 'text-slate-400'}>
          {selected ? getLabel(selected) : placeholder}
        </span>
        <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-y-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="p-2 sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          {value && (
            <button type="button" onClick={() => { onChange(''); setOpen(false); setQuery(''); }} className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">Clear selection</button>
          )}
          {filtered.length === 0 && <div className="px-3 py-2 text-xs text-slate-500">No matches.</div>}
          {filtered.map((o) => (
            <button
              key={getValue(o)}
              type="button"
              onClick={() => { onChange(String(getValue(o))); setOpen(false); setQuery(''); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                String(getValue(o)) === String(value) ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {getLabel(o)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}