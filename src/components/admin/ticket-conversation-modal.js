'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from './modal';

const STATUS_OPTIONS = [
  { value: 1, label: 'Pending' },
  { value: 2, label: 'Opened' },
  { value: 3, label: 'Resolved' },
  { value: 4, label: 'Closed' },
  { value: 5, label: 'Reopened' },
];

function fmt(d) {
  if (!d) return '';
  const t = new Date(d);
  return Number.isFinite(t.getTime()) ? t.toLocaleString() : '';
}

export default function TicketConversationModal({ open, onClose, ticketId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function load() {
    if (!ticketId) return;
    setLoading(true); setErr('');
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`);
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Failed to load.'); return; }
      setTicket(json.data.ticket);
      setMessages(json.data.messages || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { if (open && ticketId) load(); /* eslint-disable-next-line */ }, [open, ticketId]);

  async function send() {
    if (!reply.trim()) return;
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply.trim() }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Send failed.'); return; }
      setReply('');
      await load();
      router.refresh();
    } finally { setBusy(false); }
  }

  async function changeStatus(s) {
    setBusy(true); setErr('');
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: s }),
      });
      const json = await res.json();
      if (json.error) { setErr(json.message || 'Update failed.'); return; }
      await load();
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={ticket ? `Ticket #${ticket.id} — ${ticket.subject || '(no subject)'}` : 'Ticket'} size="xl">
      {loading ? (
        <div className="text-sm text-slate-500">Loading…</div>
      ) : ticket ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div><div className="text-xs text-slate-500">User</div><div className="text-slate-900 dark:text-white">{ticket.user_name || `User #${ticket.user_id}`}</div></div>
            <div><div className="text-xs text-slate-500">Email</div><div className="text-slate-900 dark:text-white">{ticket.email || ticket.user_email || '—'}</div></div>
            <div><div className="text-xs text-slate-500">Type</div><div className="text-slate-900 dark:text-white">{ticket.ticket_type_title || '—'}</div></div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-950">
            <div className="text-xs text-slate-500 mb-1">Description</div>
            <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{ticket.description || '—'}</div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Conversation</h4>
              <select value={Number(ticket.status)} onChange={(e) => changeStatus(Number(e.target.value))} disabled={busy}
                className="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 py-1">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>Status: {o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900">
              {messages.length === 0 && <div className="text-xs text-slate-500">No replies yet.</div>}
              {messages.map((m) => {
                const mine = m.user_type === 'admin';
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      mine
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}>
                      <div className="text-[10px] opacity-75 mb-0.5">{mine ? 'Admin' : (m.user_name || m.user_type || 'User')} · {fmt(m.date_created)}</div>
                      <div className="whitespace-pre-wrap">{m.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={3}
              placeholder="Write a reply…"
              className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {err && <div className="text-sm text-red-600 mt-1">{err}</div>}
            <div className="flex justify-end mt-2">
              <button type="button" onClick={send} disabled={busy || !reply.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60">
                {busy ? 'Sending…' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}