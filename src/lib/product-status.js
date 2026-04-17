export const PRODUCT_STATUS = {
  0: { label: 'Deactivated', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  1: { label: 'Approved',    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  2: { label: 'Not-Approved', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
};

export function productStatusLabel(s) {
  return PRODUCT_STATUS[Number(s)]?.label || '—';
}

export function productStatusBadge(s) {
  return PRODUCT_STATUS[Number(s)]?.badge || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}