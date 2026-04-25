'use client';

export default function SellerRating({ value, count }) {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  const full = Math.floor(v);
  return (
    <div className="inline-flex flex-col items-start">
      <span className="inline-flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`w-3.5 h-3.5 ${i < full ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </span>
      <span className="text-xs text-slate-500 mt-0.5">({Number(value || 0).toFixed(1)}/{count || 0})</span>
    </div>
  );
}