'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NOTIFICATION_MODULES, NOTIFICATION_MATRIX_COLUMNS } from '@/lib/notification-types';

export default function NotificationMatrixTab({ initial }) {
  const router = useRouter();
  const [matrix, setMatrix] = useState(() => seedMatrix(initial));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  function toggle(moduleKey, recipient) {
    setMatrix((prev) => {
      const k = `${moduleKey}_${recipient}`;
      const next = { ...prev, [k]: prev[k] ? 0 : 1 };
      return next;
    });
  }

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/notification-matrix', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matrix),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'Notification matrix updated.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Module / Permissions</th>
              {NOTIFICATION_MATRIX_COLUMNS.map((c) => (
                <th key={c.key} className="px-4 py-3 text-center">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {NOTIFICATION_MODULES.map((m) => (
              <tr key={m.key}>
                <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">{m.key}</td>
                {NOTIFICATION_MATRIX_COLUMNS.map((c) => {
                  const available = m.recipients.includes(c.key);
                  if (!available) return <td key={c.key} className="px-4 py-3 text-center text-slate-300 dark:text-slate-700">—</td>;
                  const k = `${m.key}_${c.key}`;
                  return (
                    <td key={c.key} className="px-4 py-3 text-center">
                      <input type="checkbox" checked={!!matrix[k]} onChange={() => toggle(m.key, c.key)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-start gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
        <button type="button" onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60">
          {busy ? 'Saving…' : 'Update User'}
        </button>
      </div>
    </div>
  );
}

function seedMatrix(initial) {
  const base = {};
  if (!initial || typeof initial !== 'object') return base;
  for (const [k, v] of Object.entries(initial)) {
    base[k] = Number(v) ? 1 : 0;
  }
  return base;
}