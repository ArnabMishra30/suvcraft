'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SMS_PLACEHOLDERS } from '@/lib/notification-types';

const inputCls = 'block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

function KeyValueList({ pairs, onChange, label = 'Add Header', addLabel = 'Add Header' }) {
  function add() { onChange([...(pairs || []), { key: '', value: '' }]); }
  function update(i, k, v) {
    const next = pairs.map((p, idx) => idx === i ? { ...p, [k]: v } : p);
    onChange(next);
  }
  function remove(i) { onChange(pairs.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
        <button type="button" onClick={add}
          className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          {addLabel}
        </button>
      </div>
      {(!pairs || pairs.length === 0) ? (
        <div className="text-xs text-slate-500 italic">No entries — click "{addLabel}" to add one.</div>
      ) : (
        <div className="space-y-2">
          {pairs.map((p, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
              <input className={inputCls} value={p.key || ''} onChange={(e) => update(i, 'key', e.target.value)} placeholder="Key" />
              <input className={inputCls} value={p.value || ''} onChange={(e) => update(i, 'value', e.target.value)} placeholder="Value" />
              <button type="button" onClick={() => remove(i)}
                className="p-2 rounded-md text-red-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function pairsFromKv(keys = [], values = []) {
  const out = [];
  const len = Math.max(keys.length, values.length);
  for (let i = 0; i < len; i++) out.push({ key: keys[i] || '', value: values[i] || '' });
  return out;
}

export default function SmsGatewayConfigTab({ initial }) {
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState(initial?.base_url || '');
  const [method, setMethod] = useState(String(initial?.sms_gateway_method || 'POST').toUpperCase());
  const [accountSid, setAccountSid] = useState(initial?.account_sid || '');
  const [authToken, setAuthToken] = useState(initial?.auth_token || '');
  const [activeBox, setActiveBox] = useState('header');
  const [headers, setHeaders] = useState(pairsFromKv(initial?.header_key, initial?.header_value));
  const [bodyPairs, setBodyPairs] = useState(pairsFromKv(initial?.body_key, initial?.body_value));
  const [paramsPairs, setParamsPairs] = useState(pairsFromKv(initial?.params_key, initial?.params_value));
  const [textFormat, setTextFormat] = useState(initial?.text_format_data || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ kind: '', text: '' });

  function reset() {
    setBaseUrl(initial?.base_url || '');
    setMethod(String(initial?.sms_gateway_method || 'POST').toUpperCase());
    setAccountSid(initial?.account_sid || '');
    setAuthToken(initial?.auth_token || '');
    setHeaders(pairsFromKv(initial?.header_key, initial?.header_value));
    setBodyPairs(pairsFromKv(initial?.body_key, initial?.body_value));
    setParamsPairs(pairsFromKv(initial?.params_key, initial?.params_value));
    setTextFormat(initial?.text_format_data || '');
    setMsg({ kind: '', text: '' });
  }

  function generateAuthHeader() {
    if (!accountSid || !authToken) {
      alert('Enter Account SID and Auth Token first.');
      return;
    }
    const token = `Basic ${typeof window !== 'undefined' ? window.btoa(`${accountSid}:${authToken}`) : ''}`;
    setHeaders([...headers, { key: 'Authorization', value: token }]);
    setActiveBox('header');
  }

  async function save() {
    setBusy(true); setMsg({ kind: '', text: '' });
    try {
      const res = await fetch('/api/admin/settings/sms-gateway', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_url: baseUrl,
          sms_gateway_method: method,
          account_sid: accountSid,
          auth_token: authToken,
          text_format_data: textFormat,
          header_key: headers.map((p) => p.key),
          header_value: headers.map((p) => p.value),
          body_key: bodyPairs.map((p) => p.key),
          body_value: bodyPairs.map((p) => p.value),
          params_key: paramsPairs.map((p) => p.key),
          params_value: paramsPairs.map((p) => p.value),
        }),
      });
      const json = await res.json();
      if (json.error) { setMsg({ kind: 'error', text: json.message || 'Save failed.' }); return; }
      setMsg({ kind: 'success', text: 'SMS gateway settings updated.' });
      router.refresh();
    } catch { setMsg({ kind: 'error', text: 'Network error.' }); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 p-3 text-sm text-blue-900 dark:text-blue-200">
        <span className="font-semibold">Confused?</span> Follow the setup guide below.
        <a href="https://www.twilio.com/docs/sms" target="_blank" rel="noreferrer" className="ml-2 text-indigo-600 hover:text-indigo-500 font-medium">View Instructions</a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-4">
        <div>
          <label className={labelCls}>Base URL</label>
          <input className={inputCls} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="Enter Base URL" />
        </div>
        <div>
          <label className={labelCls}>Method</label>
          <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="POST">POST</option>
            <option value="GET">GET</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Authorization Token</div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <label className={labelCls}>Account SID</label>
            <input className={inputCls} value={accountSid} onChange={(e) => setAccountSid(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Auth Token</label>
            <input className={inputCls} value={authToken} onChange={(e) => setAuthToken(e.target.value)} />
          </div>
          <button type="button" onClick={generateAuthHeader}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-emerald-600 hover:bg-emerald-500 text-white">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Create
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 -mb-px">
          {['header', 'body', 'params'].map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveBox(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md border ${
                activeBox === tab
                  ? 'border-slate-200 dark:border-slate-800 border-b-white dark:border-b-slate-900 bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
          ))}
        </div>
        <div className="border border-slate-200 dark:border-slate-800 rounded-b-lg rounded-tr-lg p-4 -mt-px bg-white dark:bg-slate-900">
          {activeBox === 'header' && <KeyValueList pairs={headers} onChange={setHeaders} label="Add Header Data" addLabel="Add Header" />}
          {activeBox === 'body' && (
            <div className="space-y-3">
              <KeyValueList pairs={bodyPairs} onChange={setBodyPairs} label="Add Body Data" addLabel="Add Body" />
              <div>
                <label className={labelCls}>Text Format</label>
                <textarea rows={3} className={inputCls} value={textFormat} onChange={(e) => setTextFormat(e.target.value)} placeholder='Optional — e.g. {"to":"{mobile_number_with_country_code}","body":"{message}"}' />
              </div>
            </div>
          )}
          {activeBox === 'params' && <KeyValueList pairs={paramsPairs} onChange={setParamsPairs} label="Add Params Data" addLabel="Add Param" />}
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-500 mb-2">Available placeholders — click to copy:</div>
        <div className="flex flex-wrap gap-2">
          {SMS_PLACEHOLDERS.map((p) => (
            <button key={p} type="button"
              onClick={async () => { try { await navigator.clipboard.writeText(p); } catch {} }}
              className="px-3 py-1.5 rounded-md bg-slate-900 dark:bg-slate-700 text-white text-xs font-mono hover:bg-slate-800 dark:hover:bg-slate-600">
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-start gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {msg.text && <span className={`mr-auto text-sm ${msg.kind === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</span>}
        <button type="button" onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-amber-500 hover:bg-amber-600 text-white">
          Reset
        </button>
        <button type="button" onClick={save} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-sm bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60">
          {busy ? 'Saving…' : 'Update SMS Gateway Settings'}
        </button>
      </div>
    </div>
  );
}