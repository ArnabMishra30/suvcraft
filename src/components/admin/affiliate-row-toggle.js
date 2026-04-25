'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AffiliateRowToggle({ id, value }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function toggle() {
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/admin/products/affiliate/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_in_affiliate: value ? 0 : 1 }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Failed.'); return; }
      router.refresh();
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={toggle}
        title={value ? 'Click to set No' : 'Click to set Yes'}
        className="relative inline-flex"
      >
        <span className={`w-10 h-6 rounded-full transition ${value ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ${value ? 'left-[1.125rem]' : 'left-0.5'}`} />
      </button>
      <span className={`text-xs font-medium ${value ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500'}`}>{value ? 'Yes' : 'No'}</span>
      {err && <span className="text-xs text-red-600 ml-1">{err}</span>}
    </div>
  );
}