'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CategoryFormModal from './category-form-modal';
import ProductImage from './product-image';

export function ViewToggle() {
  const params = useSearchParams();
  const view = params.get('view') === 'tree' ? 'tree' : 'list';
  const otherView = view === 'tree' ? 'list' : 'tree';
  function buildHref(v) {
    const sp = new URLSearchParams(params);
    if (v === 'list') sp.delete('view'); else sp.set('view', v);
    return `?${sp.toString()}`;
  }
  return (
    <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
      <Link href={buildHref('list')} className={`px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1 ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        List View
      </Link>
      <Link href={buildHref('tree')} className={`px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 ${view === 'tree' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l4-4 4 4M7 4v16M21 16l-4 4-4-4M17 20V4" /></svg>
        Tree View
      </Link>
    </div>
  );
}

export function AddCategoryButton({ parents }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Add Category
      </button>
      <CategoryFormModal open={open} onClose={() => setOpen(false)} parents={parents} />
    </>
  );
}

export function CategoryStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const value = params.get('status') || '';
  function change(v) {
    const sp = new URLSearchParams(params);
    if (v) sp.set('status', v); else sp.delete('status');
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  }
  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
  return (
    <div className="max-w-xs">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
      <select value={value} onChange={(e) => change(e.target.value)} className={inputCls}>
        <option value="">Select Status</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>
    </div>
  );
}

export function CategoryRowActions({ row, parents }) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setMenu(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function toggleStatus() {
    setMenu(false); setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: row.status ? 0 : 1 }),
      });
      const json = await res.json();
      if (json.error) alert(json.message);
      router.refresh();
    } finally { setBusy(false); }
  }

  async function onDelete() {
    setMenu(false);
    if (!confirm(`Delete category "${row.name}"?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/categories/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) alert(json.message);
      else router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <>
      <div ref={ref} className="relative inline-block">
        <button type="button" onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }} disabled={busy} title="Actions" className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-60">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
        </button>
        {menu && (
          <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1">
            <button type="button" onClick={() => { setMenu(false); setEditOpen(true); }} className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Edit
            </button>
            <button type="button" onClick={toggleStatus} className="w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-2">
              {row.status
                ? <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59" /></svg>
                : <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              {row.status ? 'Deactivate' : 'Activate'}
            </button>
            <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
            <button type="button" onClick={onDelete} className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 inline-flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
              Delete
            </button>
          </div>
        )}
      </div>
      <CategoryFormModal open={editOpen} onClose={() => setEditOpen(false)} initial={row} parents={parents} />
    </>
  );
}

function buildTree(rows) {
  const byParent = new Map();
  for (const r of rows) {
    const pid = r.parent_id || 0;
    if (!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid).push(r);
  }
  return byParent;
}

export function CategoryTree({ rows, parents }) {
  const map = buildTree(rows);
  return (
    <div className="space-y-1">
      {(map.get(0) || []).map((node) => (
        <TreeNode key={node.id} node={node} map={map} depth={0} parents={parents} />
      ))}
    </div>
  );
}

function TreeNode({ node, map, depth, parents }) {
  const [open, setOpen] = useState(true);
  const children = map.get(node.id) || [];
  const hasChildren = children.length > 0;
  return (
    <div>
      <div className="flex items-center gap-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-950/50 rounded px-2" style={{ marginLeft: depth * 24 }}>
        <button type="button" onClick={() => setOpen((o) => !o)} className={`w-4 h-4 inline-flex items-center justify-center text-slate-500 ${hasChildren ? '' : 'invisible'}`}>
          {open
            ? <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>}
        </button>
        <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-amber-600 flex-shrink-0">
          {node.image ? <ProductImage src={node.image} alt="" /> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.097.903 2 2 2h16c1.097 0 2-.903 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" /></svg>}
        </div>
        <span className="text-sm font-medium text-slate-900 dark:text-white">{node.name}</span>
        {!node.status && <span className="text-[10px] uppercase tracking-wide text-slate-400">inactive</span>}
        <div className="ml-auto"><CategoryRowActions row={node} parents={parents} /></div>
      </div>
      {open && hasChildren && children.map((c) => (
        <TreeNode key={c.id} node={c} map={map} depth={depth + 1} parents={parents} />
      ))}
    </div>
  );
}