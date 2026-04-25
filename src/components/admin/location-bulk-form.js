'use client';

import { useRef, useState } from 'react';
import Modal from './modal';

export default function LocationBulkForm() {
  const [type, setType] = useState('');
  const [locationType, setLocationType] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const fileRef = useRef(null);

  function reset() {
    setType(''); setLocationType(''); setFile(null);
    setResult(null); setErr('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr(''); setResult(null);
    if (!type) { setErr('Please select Type.'); return; }
    if (!locationType) { setErr('Please select Location Type.'); return; }
    if (!file) { setErr('Please choose a CSV file.'); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      fd.append('locationType', locationType);
      const res = await fetch('/api/admin/location/bulk-upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Upload failed.'); return; }
      setResult(json.data);
    } catch {
      setErr('Network error.');
    } finally {
      setBusy(false);
    }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" /></svg>
            Bulk Upload / Download
          </h2>
          <button type="button" onClick={() => setHelpOpen(true)}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 8h6M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" /></svg>
            Location Bulk Instructions
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelCls}>Type <span className="text-slate-400">[upload/update]</span> <span className="text-red-500">*</span></label>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
              <option value="">Select</option>
              <option value="upload">Upload</option>
              <option value="update">Update</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Location Type <span className="text-slate-400">[Zipcodes/Cities]</span> <span className="text-red-500">*</span></label>
            <select value={locationType} onChange={(e) => setLocationType(e.target.value)} className={inputCls}>
              <option value="">Select</option>
              <option value="zipcodes">Zipcodes</option>
              <option value="cities">Cities</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>File <span className="text-red-500">*</span></label>
            <input ref={fileRef} type="file" accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-slate-300 dark:file:border-slate-700 file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-300 file:font-medium hover:file:bg-slate-200 dark:hover:file:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950" />
          </div>

          {err && (
            <div role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">{err}</div>
          )}

          {result && (
            <div role="status" className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 px-3 py-3 text-sm text-emerald-800 dark:text-emerald-200 space-y-2">
              <div className="font-medium">
                {result.kind === 'upload'
                  ? `${result.created} of ${result.total} ${result.locationType === 'zipcodes' ? 'zipcode' : 'city'}(s) created.`
                  : `${result.updated} of ${result.total} ${result.locationType === 'zipcodes' ? 'zipcode' : 'city'}(s) updated.`}
              </div>
              {result.errors?.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-amber-700 dark:text-amber-300">{result.errors.length} row(s) had errors — click to expand</summary>
                  <ul className="mt-2 list-disc pl-5 text-xs text-amber-800 dark:text-amber-200 space-y-0.5 max-h-48 overflow-y-auto">
                    {result.errors.map((er, i) => <li key={i}>Row {er.row}: {er.message}</li>)}
                  </ul>
                </details>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-5m2 9a8 8 0 01-14 5" /></svg>
              Reset
            </button>
            <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60">
              {busy ? 'Uploading…' : 'Submit'}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </form>
      </div>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Location Bulk Instructions" size="lg">
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300">
          <BulkSection
            title="Instructions for bulk upload"
            blocks={[
              {
                heading: 'Zipcode data',
                items: [
                  ['zipcode', 'zipcode value', 'mandatory'],
                ],
              },
              {
                heading: 'City data',
                items: [
                  ['city_name', 'city name', 'mandatory'],
                ],
              },
              {
                heading: 'Areas data',
                items: [
                  ['area_name', 'city name', 'mandatory'],
                  ['city_id', 'You can find from Location → Cities section', 'mandatory'],
                  ['zipcode_id', 'You can find from Location → Zipcodes section', 'mandatory'],
                  ['minimum_free_delivery_order_amount', 'You can find from Location → Zipcodes section', 'optional'],
                  ['delivery_charges', 'You can find from Location → Zipcodes section', 'optional'],
                ],
              },
            ]}
          />

          <BulkSection
            title="Instructions for bulk update"
            blocks={[
              {
                heading: 'Zipcode data for update',
                items: [
                  ['id', 'You can find from Location → Zipcodes section', 'mandatory'],
                  ['zipcode', 'zipcode value', 'mandatory'],
                ],
              },
              {
                heading: 'City data for update',
                items: [
                  ['id', 'You can find from Location → Cities section', 'mandatory'],
                  ['city_name', 'city name', 'mandatory'],
                ],
              },
              {
                heading: 'Areas data for update',
                items: [
                  ['id', 'You can find from Location → Areas section', 'mandatory'],
                  ['area_name', 'city name', 'mandatory'],
                  ['city_id', 'You can find from Location → Cities section', 'mandatory'],
                  ['zipcode_id', 'You can find from Location → Zipcodes section', 'mandatory'],
                  ['minimum_free_delivery_order_amount', 'You can find from Location → Zipcodes section', 'optional'],
                  ['delivery_charges', 'You can find from Location → Zipcodes section', 'optional'],
                ],
              },
            ]}
          />
        </div>
      </Modal>
    </>
  );
}