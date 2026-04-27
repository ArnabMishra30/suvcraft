'use client';

import { useState } from 'react';

export default function SmsGatewayTabs({ tabs }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-1 px-2 pt-2 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setActive(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t-md border ${
              active === t.id
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-b-white dark:border-b-slate-900 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={t.icon} /></svg>
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-5">
        {tabs.map((t) => (
          <div key={t.id} className={active === t.id ? '' : 'hidden'}>{t.content}</div>
        ))}
      </div>
    </div>
  );
}