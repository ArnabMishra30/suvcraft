'use client';

import { useState } from 'react';

export default function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  const url = src ? (src.startsWith('http') || src.startsWith('/') ? src : `/${src.replace(/^\/?/, '')}`) : '';

  if (!url || failed) {
    return (
      <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt || ''}
      className="w-12 h-12 rounded-md object-cover bg-slate-100 dark:bg-slate-800"
      onError={() => setFailed(true)}
    />
  );
}