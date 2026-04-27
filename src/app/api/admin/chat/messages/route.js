import { ok, fail } from '@/lib/api-response';
import { requireRole } from '@/lib/auth/require';
import { getMessagesBetween, sendMessage, markConversationRead } from '@/lib/repos/chat';

export async function GET(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const sp = new URL(req.url).searchParams;
  const userId = Number(sp.get('userId') || 0);
  if (!userId) return fail('userId is required.', 422);
  const since = Number(sp.get('since') || 0);
  const adminId = auth.session?.uid || 0;
  const all = await getMessagesBetween(adminId, userId);
  await markConversationRead(adminId, userId);
  const messages = since > 0 ? all.filter((m) => m.id > since) : all;
  return ok({ messages });
}

export async function POST(req) {
  const auth = await requireRole(['admin']);
  if (auth.response) return auth.response;
  const adminId = auth.session?.uid || 0;
  const body = await req.json().catch(() => ({}));
  const toId = Number(body?.toId || 0);
  if (!toId) return fail('toId is required.', 422);
  try {
    const id = await sendMessage({ fromId: adminId, toId, message: body?.message });
    return ok({ id }, { message: 'Sent.' });
  } catch (e) {
    return fail(e.message || 'Send failed.', 422);
  }
}