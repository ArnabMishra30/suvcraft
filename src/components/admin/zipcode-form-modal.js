'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

function CityPicker({ value, onChange, cities = [], onCityCreated }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ref = useRef(null);

  const selected = cities.find((c) => String(c.id) === String(value));
  const filtered = query
    ? cities.filter((c) => String(c.name).toLowerCase().includes(query.toLowerCase()))
    : cities;

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) close(); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function close() { setOpen(false); setQuery(''); setAdding(false); setNewName(''); setErr(''); }

  async function saveNewCity() {
    const name = newName.trim();
    if (!name) { setErr('City name is required.'); return; }
    setBusy(true); setErr('');
    try {
      const res = await fetch('/api/admin/cities', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      onCityCreated?.({ id: json.data.id, name });
      onChange(String(json.data.id));
      close();
    } catch { setErr('Network error.'); }
    finally { setBusy(false); }
  }

  return (
    <div ref={ref} className="relative">
      {open ? (
        <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
          placeholder="Search City…"
          className="block w-full rounded-lg border border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-slate-950 px-3 py-2 pr-8 text-sm text-slate-900 dark:text-slate-100 focus:outline-none" />
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className="block w-full text-left rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <span className={selected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
            {selected ? selected.name : 'Search City…'}
          </span>
        </button>
      )}
      <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d={open ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
      </svg>
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-72 overflow-y-auto rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1">
          {adding ? (
            <div className="px-3 py-2 space-y-2">
              <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveNewCity(); }}
                placeholder="New city name"
                className="block w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              {err && <div className="text-xs text-red-600">{err}</div>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setAdding(false); setNewName(''); setErr(''); }} className="px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="button" onClick={saveNewCity} disabled={busy} className="px-3 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => { setAdding(true); setNewName(query); }}
                className="w-full text-left px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 font-medium">
                + Add New
              </button>
              {filtered.length === 0 && <div className="px-3 py-2 text-xs text-slate-500">No matches.</div>}
              {filtered.map((c) => (
                <button key={c.id} type="button" onClick={() => { onChange(String(c.id)); close(); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                    String(c.id) === String(value) ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                  {c.name}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ZipcodeFormModal({ open, onClose, initial, cities = [] }) {
  const router = useRouter();
  const isEdit = !!initial?.id;
  const [zipcode, setZipcode] = useState('');
  const [cityId, setCityId] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [charges, setCharges] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [localCities, setLocalCities] = useState(cities);

  useEffect(() => { setLocalCities(cities); }, [cities]);

  useEffect(() => {
    if (!open) return;
    setZipcode(initial?.zipcode || '');
    setCityId(initial?.city_id ? String(initial.city_id) : '');
    setMinAmount(initial?.minimum_free_delivery_order_amount != null ? String(initial.minimum_free_delivery_order_amount) : '');
    setCharges(initial?.delivery_charges != null ? String(initial.delivery_charges) : '');
    setErr('');
  }, [open, initial]);

  async function save() {
    if (!zipcode.trim()) { setErr('Zipcode is required.'); return; }
    if (!cityId) { setErr('City is required.'); return; }
    setBusy(true); setErr('');
    try {
      const url = isEdit ? `/api/admin/zipcodes/${initial.id}` : '/api/admin/zipcodes';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipcode: zipcode.trim(),
          city: Number(cityId),
          minimum_free_delivery_order_amount: Number(minAmount || 0),
          delivery_charges: Number(charges || 0),
        }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Save failed.'); return; }
      onClose();
      router.refresh();
    } catch { setErr('Network error.'); }
    finally { setBusy(false); }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Zipcode' : 'Add Zipcode'} size="md"
      footer={<>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button type="button" onClick={save} disabled={busy} className="px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">{busy ? 'Saving…' : (isEdit ? 'Update Zipcode' : 'Add Zipcode')}</button>
      </>}>
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Zipcode <span className="text-red-500">*</span></label>
          <p className="text-xs text-slate-500 mb-1">(?)</p>
          <input value={zipcode} onChange={(e) => setZipcode(e.target.value)} className={inputCls} placeholder="Zipcode" />
        </div>
        <div>
          <label className={labelCls}>City <span className="text-red-500">*</span></label>
          <CityPicker value={cityId} onChange={setCityId} cities={localCities}
            onCityCreated={(c) => setLocalCities((prev) => [c, ...prev.filter((x) => x.id !== c.id)])} />
        </div>
        <div>
          <label className={labelCls}>Minimum Free Delivery Order Amount <span className="text-red-500">*</span></label>
          <input type="number" min="0" step="0.01" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className={inputCls} placeholder="Minimum Free Delivery Order Amount" />
        </div>
        <div>
          <label className={labelCls}>Delivery Charges <span className="text-red-500">*</span></label>
          <input type="number" min="0" step="0.01" value={charges} onChange={(e) => setCharges(e.target.value)} className={inputCls} placeholder="Delivery Charges" />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
      </div>
    </Modal>
  );
}