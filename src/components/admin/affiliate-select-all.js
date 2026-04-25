'use client';

export default function AffiliateSelectAll() {
  function onChange(e) {
    const checked = e.target.checked;
    document.querySelectorAll('input[data-bulk="aff-row"]').forEach((cb) => {
      if (cb.checked !== checked) {
        cb.checked = checked;
        cb.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
  return (
    <input
      type="checkbox"
      onChange={onChange}
      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      aria-label="Select all"
    />
  );
}