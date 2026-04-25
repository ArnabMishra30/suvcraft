'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const USER_TYPE_OPTIONS = [
  { value: '', label: 'Select User Type' },
  { value: 'customer', label: 'Customer' },
  { value: 'seller', label: 'Seller' },
  { value: 'delivery_boy', label: 'Delivery Boy' },
  { value: 'affiliate', label: 'Affiliate User' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Select option' },
  { value: '0', label: 'Pending' },
  { value: '1', label: 'Approved' },
  { value: '2', label: 'Rejected' },
];

export default function PaymentRequestFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [draft, setDraft] = useState({
    userType: params.get('userType') || '',
    status: params.get('status') || '',
  });

  useEffect(() => {
    setDraft({
      userType: params.get('userType') || '',
      status: params.get('status') || '',
    });
  }, [params]);

  function applyFilters(next) {
    const sp = new URLSearchParams(params);
    if (next.userType) sp.set('userType', next.userType); else sp.delete('userType');
    if (next.status) sp.set('status', next.status); else sp.delete('status');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }

  function setUserType(v) { const next = { ...draft, userType: v }; setDraft(next); applyFilters(next); }
  function setStatus(v) { const next = { ...draft, status: v }; setDraft(next); applyFilters(next); }

  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';
  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className={labelCls}>Filter By User</label>
        <select value={draft.userType} onChange={(e) => setUserType(e.target.value)} className={inputCls}>
          {USER_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
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