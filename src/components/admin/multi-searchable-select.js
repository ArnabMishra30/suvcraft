'use client';

import { useEffect, useRef, useState } from 'react';

export default function MultiSearchableSelect({
  values = [],
  onChange,
  options = [],
  placeholder = 'Search…',
  getLabel = (o) => o.name,
  getValue = (o) => o.id,
  getSubLabel,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  const selectedSet = new Set(values.map(String));
  const selectedItems = options.filter((o) => selectedSet.has(String(getValue(o))));
  const filtered = query
    ? options.filter((o) => String(getLabel(o)).toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function toggle(v) {
    const id = String(v);
    const next = selectedSet.has(id)
      ? values.filter((x) => String(x) !== id)
      : [...values, id];
    onChange(next);
  }

  function remove(v) {
    onChange(values.filter((x) => String(x) !== String(v)));
  }

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(true)}
        className={`min-h-[38px] flex flex-wrap items-center gap-1 rounded-lg border ${open ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-950 px-2 py-1.5 text-sm cursor-text`}>
        {selectedItems.map((o) => (
          <span key={getValue(o)} className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded text-xs">
            {getLabel(o)}
            <button type="button" onClick={(e) => { e.stopPropagation(); remove(getValue(o)); }} className="hover:text-indigo-900 dark:hover:text-indigo-100">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </span>
        ))}
        {open ? (
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } }}
            placeholder={placeholder}
            className="flex-1 min-w-[8rem] bg-transparent border-0 outline-none text-sm text-slate-900 dark:text-slate-100 px-1" />
        ) : (
          !selectedItems.length && <span className="text-slate-400 px-1">{placeholder}</span>
        )}
      </div>
      <svg className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={open ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
      </svg>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-y-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1">
          {filtered.length === 0 && <div className="px-3 py-2 text-xs text-slate-500">No matches.</div>}
          {filtered.map((o) => {
            const id = String(getValue(o));
            const isSelected = selectedSet.has(id);
            return (
              <button key={id} type="button" onClick={() => toggle(getValue(o))}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                <span className="inline-flex items-center justify-center w-4 h-4 rounded border border-slate-300 dark:border-slate-600">
                  {isSelected && <svg className="w-3 h-3 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </span>
                <span className="flex-1">{getLabel(o)}</span>
                {getSubLabel && <span className="text-xs text-slate-500">{getSubLabel(o)}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}