'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SearchableSelect from './searchable-select';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: '1', label: 'Pending' },
  { value: '2', label: 'Opened' },
  { value: '3', label: 'Resolved' },
  { value: '4', label: 'Closed' },
  { value: '5', label: 'Reopened' },
];

export default function TicketFilters({ types = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [draft, setDraft] = useState({
    typeId: params.get('typeId') || '',
    status: params.get('status') || '',
  });

  useEffect(() => {
    setDraft({
      typeId: params.get('typeId') || '',
      status: params.get('status') || '',
    });
  }, [params]);

  function applyFilters(next) {
    const sp = new URLSearchParams(params);
    if (next.typeId) sp.set('typeId', next.typeId); else sp.delete('typeId');
    if (next.status) sp.set('status', next.status); else sp.delete('status');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function setType(v) { const next = { ...draft, typeId: v }; setDraft(next); applyFilters(next); }
  function setStatus(v) { const next = { ...draft, status: v }; setDraft(next); applyFilters(next); }

  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';
  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Filter By Ticket Type</label>
        <SearchableSelect value={draft.typeId} onChange={setType} options={types} placeholder="Select Ticket Type" />
      </div>
      <div>
        <label className={labelCls}>Filter By Status</label>
        <select value={draft.status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}