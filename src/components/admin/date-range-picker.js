'use client';

import { useEffect, useRef, useState } from 'react';

const PRESETS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'last7', label: 'Last 7 Days' },
  { key: 'last30', label: 'Last 30 Days' },
  { key: 'thismonth', label: 'This Month' },
  { key: 'lastmonth', label: 'Last Month' },
  { key: 'custom', label: 'Custom Range' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const fmt = (d) => (d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : '');
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a, b) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const inRange = (d, s, e) => {
  if (!d || !s || !e) return false;
  const t = d.getTime(), a = Math.min(s.getTime(), e.getTime()), b = Math.max(s.getTime(), e.getTime());
  return t > a && t < b;
};

function buildGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

export default function DateRangePicker({ from = '', to = '', onChange, placeholder = 'Select Date Range To Filter' }) {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(fromISO(from));
  const [end, setEnd] = useState(fromISO(to));
  const [hover, setHover] = useState(null);
  const today = new Date();
  const [leftMonth, setLeftMonth] = useState(startOfMonth(fromISO(from) || today));
  const rootRef = useRef(null);

  useEffect(() => {
    setStart(fromISO(from));
    setEnd(fromISO(to));
  }, [from, to]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e) { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const rightMonth = addMonths(leftMonth, 1);
  const yearOptions = Array.from({ length: 21 }, (_, i) => today.getFullYear() - 10 + i);

  function applyPreset(key) {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    let s, e;
    if (key === 'today') { s = e = t; }
    else if (key === 'yesterday') { s = e = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 1); }
    else if (key === 'last7') { s = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 6); e = t; }
    else if (key === 'last30') { s = new Date(t.getFullYear(), t.getMonth(), t.getDate() - 29); e = t; }
    else if (key === 'thismonth') { s = new Date(t.getFullYear(), t.getMonth(), 1); e = new Date(t.getFullYear(), t.getMonth() + 1, 0); }
    else if (key === 'lastmonth') { s = new Date(t.getFullYear(), t.getMonth() - 1, 1); e = new Date(t.getFullYear(), t.getMonth(), 0); }
    else { setEnd(null); return; }
    setStart(s); setEnd(e); setLeftMonth(startOfMonth(s));
  }

  function pickDay(d) {
    if (!start || (start && end)) { setStart(d); setEnd(null); }
    else if (d < start) { setEnd(start); setStart(d); }
    else setEnd(d);
  }

  function clear() { setStart(null); setEnd(null); }

  function apply() {
    if (start && end) onChange?.({ from: toISO(start), to: toISO(end) });
    else if (start) onChange?.({ from: toISO(start), to: toISO(start) });
    else onChange?.({ from: '', to: '' });
    setOpen(false);
  }

  const display = start && end ? `${fmt(start)} - ${fmt(end)}` : start ? fmt(start) : '';

  function MonthHeader({ side, base }) {
    const y = base.getFullYear();
    const m = base.getMonth();
    return (
      <div className="flex items-center justify-between gap-2 mb-2">
        {side === 'left' ? (
          <button type="button" onClick={() => setLeftMonth(addMonths(leftMonth, -1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
        ) : <span className="w-6" />}
        <div className="flex items-center gap-1">
          <select value={m} onChange={(e) => {
            const nm = Number(e.target.value);
            setLeftMonth(side === 'left' ? new Date(y, nm, 1) : new Date(y, nm - 1, 1));
          }} className="text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-1.5 py-0.5">
            {MONTHS.map((mn, i) => <option key={i} value={i}>{mn}</option>)}
          </select>
          <select value={y} onChange={(e) => {
            const ny = Number(e.target.value);
            setLeftMonth(side === 'left' ? new Date(ny, m, 1) : new Date(ny, m - 1, 1));
          }} className="text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-1.5 py-0.5">
            {yearOptions.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
          </select>
        </div>
        {side === 'right' ? (
          <button type="button" onClick={() => setLeftMonth(addMonths(leftMonth, 1))} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : <span className="w-6" />}
      </div>
    );
  }

  function MonthGrid({ base }) {
    const cells = buildGrid(base.getFullYear(), base.getMonth());
    const previewEnd = end || hover;
    return (
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {DOW.map((d) => <div key={d} className="py-1 font-medium text-slate-500">{d}</div>)}
        {cells.map((c, i) => {
          const isStart = sameDay(c.date, start);
          const isEnd = sameDay(c.date, end);
          const between = inRange(c.date, start, previewEnd);
          const cls = (isStart || isEnd)
            ? 'bg-indigo-600 text-white font-medium'
            : between
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
              : c.inMonth
                ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900';
          return (
            <button key={i} type="button"
              onClick={() => pickDay(c.date)}
              onMouseEnter={() => setHover(c.date)}
              className={`w-8 h-8 mx-auto rounded text-xs ${cls}`}>
              {c.date.getDate()}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <span className={display ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}>{display || placeholder}</span>
        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 z-30 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl flex"
          style={{ minWidth: '640px' }}
          onMouseLeave={() => setHover(null)}>
          <div className="border-r border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-0.5 w-36">
            {PRESETS.map((p) => (
              <button key={p.key} type="button" onClick={() => applyPreset(p.key)}
                className="text-left px-3 py-1.5 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:bg-indigo-600 focus:text-white">
                {p.label}
              </button>
            ))}
          </div>
          <div className="p-3 flex-1">
            <div className="flex gap-6">
              <div className="flex-1">
                <MonthHeader side="left" base={leftMonth} />
                <MonthGrid base={leftMonth} />
              </div>
              <div className="flex-1">
                <MonthHeader side="right" base={rightMonth} />
                <MonthGrid base={rightMonth} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-sm text-slate-700 dark:text-slate-300">
                {start && end ? `${fmt(start)} - ${fmt(end)}` : start ? fmt(start) : ''}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={clear} className="px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">Clear</button>
                <button type="button" onClick={apply} className="px-4 py-1.5 text-sm rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}