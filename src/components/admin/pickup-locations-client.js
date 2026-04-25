'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Modal from './modal';

const VERIFIED_OPTIONS = [
  { value: '', label: 'All' },
  { value: '1', label: 'Verified' },
  { value: '0', label: 'Not Verified' },
];

export function VerifiedFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const current = params.get('verified') || '';
  const selected = VERIFIED_OPTIONS.find((o) => o.value === current) || VERIFIED_OPTIONS[0];

  useEffect(() => {
    function onClick(e) { if (!e.target.closest('[data-verified-filter]')) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function pick(v) {
    const sp = new URLSearchParams(params);
    if (v) sp.set('verified', v); else sp.delete('verified');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
    setOpen(false);
  }

  return (
    <div data-verified-filter className="relative max-w-xs">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <span className="text-slate-700 dark:text-slate-200">{selected.label}</span>
        <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1">
          {VERIFIED_OPTIONS.map((o) => (
            <button key={o.value} type="button" onClick={() => pick(o.value)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                o.value === current ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'
              }`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VerifyInfoButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
        Need to verify the pickup Locations
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Need to verify the pickup Locations" size="lg">
        <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <li>After adding the pickup location you need to verify the pickup location on shiprocket dashboard.</li>
          <li>
            Note: You can verify unverified pickup locations from{' '}
            <a href="https://app.shiprocket.in/" target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-500 underline">
              shiprocket dashboard
            </a>
            . New number in pickup location has to be verified once. Later additions of pickup locations with the same number will not require verification.
          </li>
          <li>After verifying the pickup location in shiprocket, you need to verify that location in the table.</li>
          <li>You will find Verified column in pickup location table on this page.</li>
        </ol>
      </Modal>
    </>
  );
}

export function PickupRowActions({ row }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleVerified() {
    setBusy(true);
    try {
      const next = Number(row.status) === 1 ? 0 : 1;
      const res = await fetch(`/api/admin/pickup-locations/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }

  async function onDelete() {
    if (!confirm(`Delete pickup location "${row.pickup_location}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/pickup-locations/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }

  const verified = Number(row.status) === 1;
  return (
    <div className="inline-flex items-center gap-1">
      <button type="button" onClick={toggleVerified} disabled={busy} title={verified ? 'Mark as not verified' : 'Mark as verified'}
        className={`p-1.5 rounded-md ${verified ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'} disabled:opacity-60`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d={verified ? 'M6 18L18 6M6 6l12 12' : 'M5 13l4 4L19 7'} />
        </svg>
      </button>
      <button type="button" onClick={onDelete} disabled={busy} title="Delete"
        className="p-1.5 rounded-md text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-60">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
      </button>
    </div>
  );
}