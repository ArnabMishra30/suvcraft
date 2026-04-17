export function formatCurrency(amount, code = 'INR') {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${code} ${n.toFixed(2)}`;
  }
}

export function formatDate(d, opts = { dateStyle: 'medium', timeStyle: 'short' }) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', opts);
}

export const STATUS_BADGE = {
  received: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  processed: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  out_for_delivery: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  returned: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export function statusBadgeClass(status) {
  return STATUS_BADGE[String(status || '').toLowerCase()] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}