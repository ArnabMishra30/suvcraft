'use client';

import { useEffect, useRef, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');
function fmt(d) {
  if (!d) return '';
  const t = new Date(d);
  if (!Number.isFinite(t.getTime())) return '';
  return `${pad(t.getDate())}/${pad(t.getMonth() + 1)}/${t.getFullYear()} ${pad(t.getHours())}:${pad(t.getMinutes())}`;
}

export default function ChatClient({ conversations = [], adminId }) {
  const [list, setList] = useState(conversations);
  const [activeId, setActiveId] = useState(conversations[0]?.user_id || null);
  const [filter, setFilter] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const lastIdRef = useRef(0);

  const active = list.find((c) => c.user_id === activeId) || null;

  async function loadMessages(uid, mode = 'full') {
    if (!uid) return;
    if (mode === 'full') setLoading(true);
    try {
      const since = mode === 'incremental' ? lastIdRef.current : 0;
      const res = await fetch(`/api/admin/chat/messages?userId=${uid}${since ? `&since=${since}` : ''}`);
      const json = await res.json();
      if (json.error) return;
      const incoming = json.data?.messages || [];
      if (mode === 'full') {
        setMessages(incoming);
        lastIdRef.current = incoming.length ? incoming[incoming.length - 1].id : 0;
      } else if (incoming.length) {
        setMessages((prev) => [...prev, ...incoming]);
        lastIdRef.current = incoming[incoming.length - 1].id;
      }
    } finally { if (mode === 'full') setLoading(false); }
  }

  async function loadConversations() {
    try {
      const res = await fetch('/api/admin/chat/conversations');
      const json = await res.json();
      if (!json.error) setList(json.data?.conversations || []);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    lastIdRef.current = 0;
    if (activeId) loadMessages(activeId, 'full');
  }, [activeId]);

  // Poll the active thread every 5s for new messages, and the conversation list every 15s.
  useEffect(() => {
    if (!activeId) return;
    const t = setInterval(() => loadMessages(activeId, 'incremental'), 5000);
    return () => clearInterval(t);
  }, [activeId]);

  useEffect(() => {
    const t = setInterval(loadConversations, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function send() {
    if (!draft.trim() || !activeId) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/chat/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toId: activeId, message: draft.trim() }),
      });
      const json = await res.json();
      if (json.error) { alert(json.message); return; }
      const sent = draft.trim();
      setDraft('');
      await loadMessages(activeId, 'full');
      loadConversations();
      setList((prev) => prev.map((c) => c.user_id === activeId
        ? { ...c, last_message: sent, last_at: new Date().toISOString() }
        : c
      ));
    } finally { setSending(false); }
  }

  const filtered = filter
    ? list.filter((c) => String(c.user_name || '').toLowerCase().includes(filter.toLowerCase())
                       || String(c.email || '').toLowerCase().includes(filter.toLowerCase()))
    : list;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 h-[70vh]">
      <aside className="border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search…" suppressHydrationWarning
            className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-slate-500">No conversations yet.</div>
          )}
          {filtered.map((c) => (
            <button key={c.user_id} type="button" suppressHydrationWarning onClick={() => setActiveId(c.user_id)}
              className={`w-full text-left px-3 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                activeId === c.user_id ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''
              }`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.user_name}</span>
                {Number(c.unread_count) > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px]">{c.unread_count}</span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-slate-500 truncate">{c.last_message || 'No messages yet'}</div>
              {c.last_at && <div suppressHydrationWarning className="mt-0.5 text-[10px] text-slate-400">{fmt(c.last_at)}</div>}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-col">
        {active ? (
          <>
            <header className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-semibold">
                {String(active.user_name || '?').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{active.user_name}</div>
                <div className="text-xs text-slate-500">{active.email || ''}</div>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-2 bg-slate-50 dark:bg-slate-950/40">
              {loading && <div className="text-xs text-slate-500">Loading…</div>}
              {!loading && messages.length === 0 && <div className="text-xs text-slate-500">No messages yet — say hi.</div>}
              {messages.map((m) => {
                const mine = Number(m.from_id) === Number(adminId);
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                    }`}>
                      <div className="whitespace-pre-wrap">{m.message}</div>
                      <div className={`mt-0.5 text-[10px] ${mine ? 'text-indigo-100' : 'text-slate-400'}`}>{fmt(m.date_created)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="border-t border-slate-200 dark:border-slate-800 p-3 flex items-end gap-2">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={1} placeholder="Type a message…"
                className="flex-1 resize-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="button" onClick={send} disabled={sending || !draft.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-60">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                {sending ? 'Sending…' : 'Send'}
              </button>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            Select a conversation to start chatting.
          </div>
        )}
      </section>
    </div>
  );
}