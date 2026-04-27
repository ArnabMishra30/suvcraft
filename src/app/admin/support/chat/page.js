import Link from 'next/link';
import { listConversations } from '@/lib/repos/chat';
import { getSession } from '@/lib/auth/session';
import ChatClient from '@/components/admin/chat-client';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const session = await getSession();
  const adminId = session?.uid || 0;
  const conversations = adminId ? await listConversations(adminId) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">Chat</h1>
          <p className="mt-1 text-sm text-slate-500">Direct conversations with customers, sellers, and delivery boys.</p>
        </div>
        <nav className="text-xs text-slate-500">
          <Link href="/admin" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
          <span className="mx-1.5">›</span>
          <Link href="/admin/support/tickets" className="hover:text-slate-700 dark:hover:text-slate-300">Support &amp; Communication</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-700 dark:text-slate-300">Chat</span>
        </nav>
      </div>

      <ChatClient conversations={conversations} adminId={adminId} />
    </div>
  );
}